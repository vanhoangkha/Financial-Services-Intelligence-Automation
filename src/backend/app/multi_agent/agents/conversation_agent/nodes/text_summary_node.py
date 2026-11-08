import logging
from uuid import UUID
from typing import Dict, Any

from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.runnables.config import RunnableConfig
from langgraph.types import StreamWriter

from app.multi_agent.agents.conversation_agent.state import ConversationState
from app.multi_agent.databases.dynamodb import get_db_session_with_context
from app.multi_agent.services.text_service import TextSummaryService
from app.multi_agent.models.message_dynamodb import MessageDynamoDB as Message, MessageTypesDynamoDB as MessageTypes
from app.multi_agent.utils.helpers import StreamWriter as ConversationStreamWriter

logger = logging.getLogger(__name__)

async def text_summary_node(
    state: ConversationState, 
    config: RunnableConfig, 
    writer: StreamWriter
) -> ConversationState:
    """
    Clean text summary node - handles text summarization requests
    """
    conversation_id = state.conversation_id
    user_message = state.messages[-1] if state.messages else ""
    node_name = config.get("metadata", {}).get("langgraph_node")
    
    try:
        logger.info(f"[TEXT_SUMMARY] Processing request for conversation {conversation_id}")
        
        # Extract text to summarize from user message
        text_to_summarize = _extract_text_from_message(user_message)
        
        if not text_to_summarize:
            response = "Xin lỗi, tôi không tìm thấy văn bản nào để tóm tắt. Vui lòng cung cấp văn bản cần tóm tắt."
        else:
            # Use TextSummaryService for summarization
            text_service = TextSummaryService()
            
            try:
                summary_result = await text_service.summarize_text(
                    text=text_to_summarize,
                    summary_type="general",
                    max_length=200,
                    language="vietnamese"
                )
                
                response = f"**Tóm tắt văn bản:**\n\n{summary_result['summary']}\n\n"
                response += f"**Thống kê:** {summary_result['word_count']['original']} từ → {summary_result['word_count']['summary']} từ "
                response += f"(tỷ lệ nén: {summary_result['compression_ratio']})"
                
            except Exception as e:
                logger.error(f"[TEXT_SUMMARY] Summarization failed: {str(e)}")
                response = f"Xin lỗi, có lỗi xảy ra khi tóm tắt văn bản: {str(e)}"
        
        # Stream response
        writer(
            ConversationStreamWriter(
                messages=[response],
                node_name=node_name,
                type=MessageTypes.AI,
            ).to_dict()
        )
        
        # Save to database
        await _save_message_to_db(conversation_id, response, MessageTypes.AI)
        
        # Update state (không append response để tránh duplicate)
        state.node_name = "text_summary_node"
        
        logger.info(f"[TEXT_SUMMARY] Completed for conversation {conversation_id}")
        return state
        
    except Exception as e:
        logger.error(f"[TEXT_SUMMARY] Node error: {str(e)}")
        error_response = "Xin lỗi, có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau."
        
        writer(
            ConversationStreamWriter(
                messages=[error_response],
                node_name=node_name,
                type=MessageTypes.AI,
            ).to_dict()
        )
        await _save_message_to_db(conversation_id, error_response, MessageTypes.AI)
        
        # Không append error response để tránh duplicate
        return state


def _extract_text_from_message(message: str) -> str:
    """
    Extract text to summarize from user message
    Simple pattern matching for common formats
    """
    try:
        message_lower = message.lower()
        
        # Pattern 1: "Tóm tắt: [text]"
        if "tóm tắt:" in message_lower:
            return message.split(":", 1)[1].strip()
        
        # Pattern 2: "Summarize: [text]"  
        if "summarize:" in message_lower:
            return message.split(":", 1)[1].strip()
        
        # Pattern 3: "Hãy tóm tắt [text]"
        if "hãy tóm tắt" in message_lower:
            return message.replace("hãy tóm tắt", "", 1).strip()
        
        # Pattern 4: If message is long enough, assume it's the text to summarize
        if len(message) > 200:
            return message
        
        # Pattern 5: Look for common prefixes
        prefixes = ["tóm tắt văn bản:", "phân tích:", "summarize this:"]
        for prefix in prefixes:
            if prefix in message_lower:
                return message_lower.replace(prefix, "").strip()
        
        return ""
        
    except Exception as e:
        logger.error(f"Error extracting text from message: {e}")
        return ""


async def _save_message_to_db(conversation_id: str, content: str, message_type: MessageTypes):
    """
    Save message to database
    """
    try:
        async with get_db_session_with_context() as session:
            message = Message(
                conversation_id=UUID(conversation_id),
                type=message_type,
                message=content
            )
            await message.save()
            
    except Exception as e:
        logger.error(f"Failed to save message to DB: {e}")


# Simple routing function for workflow
def should_use_text_summary_node(message: str) -> bool:
    """
    Simple check if message should go to text summary node
    """
    message_lower = message.lower()
    
    triggers = [
        'tóm tắt', 'summarize', 'summary',
        'phân tích tài liệu', 'analyze document',
        's3://', 'bucket:', 'pdf', 'csv'
    ]
    
    return any(trigger in message_lower for trigger in triggers)
