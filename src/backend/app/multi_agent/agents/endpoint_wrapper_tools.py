"""
VPBank K-MULT - Endpoint Wrapper Tools
Wraps existing API endpoints as Strands tools for supervisor agent
"""

from strands import tool
import asyncio
import logging
import io
from typing import Dict, Any, Optional
from fastapi import UploadFile
from datetime import datetime
from uuid import uuid4

logger = logging.getLogger(__name__)

@tool
def compliance_document_tool(query: str, file_data: Optional[Dict[str, Any]] = None) -> str:
    """
    Compliance document validation tool - uses services directly (not routes)
    Preserves EXACT logic from compliance_routes.py
    """
    try:
        logger.info(f"[COMPLIANCE_TOOL] Processing: {query[:100]}...")

        if file_data and file_data.get('raw_bytes'):
            # Use services directly instead of routes (better architecture)
            from app.multi_agent.services.compliance_service import ComplianceValidationService
            from app.multi_agent.services.text_service import TextSummaryService

            try:
                file_content = file_data.get('raw_bytes')
                filename = file_data.get('filename', 'document.pdf')
                file_extension = os.path.splitext(filename)[1].lower()

                # Extract text from document using service
                text_service = TextSummaryService()

                async def extract_and_validate():
                    # Extract text (same as route logic)
                    extracted_text = await text_service.extract_text_from_document(
                        file_content=file_content,
                        file_extension=file_extension,
                        filename=filename
                    )

                    if not extracted_text or len(extracted_text.strip()) < 50:
                        raise ValueError("Không thể trích xuất đủ văn bản từ file để kiểm tra tuân thủ")

                    # Validate compliance using service
                    compliance_service = ComplianceValidationService()
                    validation_result = await compliance_service.validate_document_compliance(
                        ocr_text=extracted_text,
                        document_type=None  # Auto-detect
                    )

                    # Add file info to result (same as route)
                    validation_result["file_info"] = {
                        "filename": filename,
                        "file_size": len(file_content),
                        "file_type": file_extension,
                        "extracted_text_length": len(extracted_text)
                    }

                    return validation_result

                # Execute with proper async handling
                try:
                    data = asyncio.run(extract_and_validate())
                except RuntimeError as e:
                    if "cannot be called from a running event loop" in str(e):
                        import concurrent.futures
                        def run_in_thread():
                            return asyncio.run(extract_and_validate())
                        with concurrent.futures.ThreadPoolExecutor() as executor:
                            future = executor.submit(run_in_thread)
                            data = future.result(timeout=30)
                    else:
                        raise e

                # Format response using EXACT endpoint result structure
                if data and isinstance(data, dict):
                    # Use data directly (already has the validation result)
                    
                    response = f"""**Kiểm tra tuân thủ - VPBank K-MULT**

**Tài liệu:** {file_data.get('filename', 'Unknown')}
**Loại tài liệu:** {data.get('document_type', 'Unknown')}
**Trạng thái:** {data.get('compliance_status', 'UNKNOWN')}
**Độ tin cậy:** {data.get('confidence_score', 0):.1%}

**Phân tích:**"""
                    
                    # Add document analysis
                    doc_analysis = data.get('document_analysis', {})
                    if doc_analysis:
                        category = doc_analysis.get('document_category', {})
                        if category.get('business_purpose'):
                            response += f"\n• **Mục đích:** {category['business_purpose']}"
                    
                    # Add violations
                    response += "\n\n**Vi phạm:**"
                    violations = data.get('violations', [])
                    if violations:
                        for i, v in enumerate(violations[:5], 1):
                            response += f"\n{i}. **{v.get('type', 'Unknown')}**: {v.get('description', 'N/A')}"
                    else:
                        response += "\nKhông phát hiện vi phạm"
                    
                    # Add recommendations
                    response += "\n\n**Khuyến nghị:**"
                    recommendations = data.get('recommendations', [])
                    if recommendations:
                        for i, r in enumerate(recommendations[:3], 1):
                            response += f"\n{i}. {r.get('description', 'N/A')}"
                    else:
                        response += "\nTài liệu tuân thủ tốt"
                    
                    response += f"\n\n**Thời gian:** {data.get('processing_time', 0):.1f}s"
                    response += f"\n*VPBank K-MULT Compliance Engine*"
                    
                    return response
                else:
                    return "**Lỗi**: Không thể xử lý tài liệu"
                    
            except Exception as e:
                logger.error(f"[COMPLIANCE_TOOL] Error: {e}")
                return f"**Lỗi kiểm tra tuân thủ**: {str(e)}"
        else:
            # Handle text-based queries using compliance node logic
            try:
                from app.multi_agent.agents.conversation_agent.nodes.compliance_node import (
                    _determine_query_type,
                    _handle_regulation_query,
                    _handle_compliance_help,
                    _handle_general_compliance_chat
                )
                
                query_type = _determine_query_type(query)
                
                async def handle_query():
                    if query_type == "regulation_query":
                        return await _handle_regulation_query(query)
                    elif query_type == "compliance_help":
                        return await _handle_compliance_help(query)
                    else:
                        return await _handle_general_compliance_chat(query)
                
                try:
                    response = asyncio.run(handle_query())
                except RuntimeError as e:
                    if "cannot be called from a running event loop" in str(e):
                        import concurrent.futures
                        def run_in_thread():
                            return asyncio.run(handle_query())
                        with concurrent.futures.ThreadPoolExecutor() as executor:
                            future = executor.submit(run_in_thread)
                            response = future.result(timeout=15)
                    else:
                        raise e
                
                return response
                
            except Exception as e:
                logger.error(f"[COMPLIANCE_TOOL] Node error: {e}")
                return f"**Lỗi xử lý tuân thủ**: {str(e)}"

    except Exception as e:
        logger.error(f"[COMPLIANCE_TOOL] Tool error: {e}")
        return f"**Lỗi kiểm tra tuân thủ**: {str(e)}"


@tool
def text_summary_document_tool(query: str, file_data: Optional[Dict[str, Any]] = None) -> str:
    """
    Text summary document tool - uses services directly (not routes)
    Preserves EXACT logic from text_routes.py
    """
    try:
        logger.info(f"[TEXT_SUMMARY_TOOL] Processing: {query[:100]}...")

        if file_data and file_data.get('raw_bytes'):
            # Use service directly instead of route (better architecture)
            from app.multi_agent.services.text_service import TextSummaryService

            try:
                file_content = file_data.get('raw_bytes')
                filename = file_data.get('filename', 'document.pdf')
                file_extension = os.path.splitext(filename)[1].lower()

                # Use TextSummaryService directly
                text_service = TextSummaryService()

                async def extract_and_summarize():
                    # Extract text from document (same as route logic)
                    extracted_text = await text_service.extract_text_from_document(
                        file_content=file_content,
                        file_extension=file_extension,
                        filename=filename,
                        max_pages=None
                    )

                    # Validate extracted text
                    if len(extracted_text.strip()) < 50:
                        raise ValueError("Không thể trích xuất đủ nội dung từ tài liệu để tóm tắt")

                    # Generate summary (same as route logic)
                    summary_result = await text_service.summarize_text(
                        text=extracted_text,
                        summary_type="general",
                        max_length=300,
                        language="vietnamese"
                    )

                    # Add document info to response (same as route)
                    summary_result["document_info"] = {
                        "filename": filename,
                        "file_size": len(file_content),
                        "file_type": file_extension,
                        "extracted_text_length": len(extracted_text),
                        "max_pages_processed": "all"
                    }

                    return summary_result

                # Execute with proper async handling
                try:
                    data = asyncio.run(extract_and_summarize())
                except RuntimeError as e:
                    if "cannot be called from a running event loop" in str(e):
                        import concurrent.futures
                        def run_in_thread():
                            return asyncio.run(extract_and_summarize())
                        with concurrent.futures.ThreadPoolExecutor() as executor:
                            future = executor.submit(run_in_thread)
                            data = future.result(timeout=60)  # Longer timeout for large files
                    else:
                        raise e

                # Format response using EXACT endpoint result structure
                if data and isinstance(data, dict):
                    
                    response = f"""**Tóm tắt tài liệu: {file_data.get('filename', 'Unknown')}**

**Nội dung tóm tắt:**
{data.get('summary', 'Không thể tóm tắt')}

**Thống kê:**"""
                    
                    # Add statistics from endpoint response
                    if 'word_count' in data:
                        word_count = data['word_count']
                        response += f"\n• **Từ gốc:** {word_count.get('original', 0):,} từ"
                        response += f"\n• **Từ tóm tắt:** {word_count.get('summary', 0):,} từ"
                    
                    if 'compression_ratio' in data:
                        response += f"\n• **Tỷ lệ nén:** {data['compression_ratio']}"
                    
                    # Add document info from endpoint response
                    if 'document_info' in data:
                        doc_info = data['document_info']
                        if doc_info.get('pages'):
                            response += f"\n• **Số trang:** {doc_info['pages']}"
                        if doc_info.get('file_size'):
                            response += f"\n• **Kích thước:** {doc_info['file_size']:,} bytes"
                    
                    response += f"\n• **Thời gian:** {data.get('processing_time', 0):.1f}s"
                    response += f"\n\n*VPBank K-MULT Text Intelligence*"
                    
                    return response
                else:
                    return f"**Lỗi**: Không thể tóm tắt file {file_data.get('filename', 'Unknown')}"
                    
            except Exception as e:
                logger.error(f"[TEXT_SUMMARY_TOOL] Error: {e}")
                return f"**Lỗi tóm tắt tài liệu**: {str(e)}"
        else:
            # Handle text-based queries using text summary node logic
            try:
                from app.multi_agent.agents.conversation_agent.nodes.text_summary_node import _extract_text_from_message
                from app.multi_agent.services.text_service import TextSummaryService
                
                # Extract text using EXACT node logic
                text_to_summarize = _extract_text_from_message(query)
                
                if not text_to_summarize or len(text_to_summarize.strip()) < 10:
                    return """**Không tìm thấy văn bản để tóm tắt**

**Hướng dẫn:**
• Gửi văn bản: "Tóm tắt: [nội dung]"
• Upload file: PDF, DOCX, TXT
• Paste văn bản dài để tôi tóm tắt"""
                
                # Use TextSummaryService with EXACT parameters
                text_service = TextSummaryService()
                
                async def summarize():
                    return await text_service.summarize_text(
                        text=text_to_summarize,
                        summary_type="general",
                        max_length=300,  # Same as endpoint default
                        language="vietnamese"
                    )
                
                try:
                    result = asyncio.run(summarize())
                except RuntimeError as e:
                    if "cannot be called from a running event loop" in str(e):
                        import concurrent.futures
                        def run_in_thread():
                            return asyncio.run(summarize())
                        with concurrent.futures.ThreadPoolExecutor() as executor:
                            future = executor.submit(run_in_thread)
                            result = future.result(timeout=30)
                    else:
                        raise e
                
                # Format response
                if result and 'summary' in result:
                    response = f"""**Tóm tắt văn bản:**

**Nội dung:**
{result['summary']}

**Thống kê:**"""
                    
                    if 'word_count' in result:
                        word_count = result['word_count']
                        response += f"\n• **Từ gốc:** {word_count['original']:,} từ"
                        response += f"\n• **Từ tóm tắt:** {word_count['summary']:,} từ"
                    
                    if 'compression_ratio' in result:
                        response += f"\n• **Tỷ lệ nén:** {result['compression_ratio']}"
                    
                    response += f"\n\n*VPBank K-MULT Text Intelligence*"
                    return response
                else:
                    return "**Lỗi**: Không thể tạo tóm tắt"
                
            except Exception as e:
                logger.error(f"[TEXT_SUMMARY_TOOL] Node error: {e}")
                return f"**Lỗi tóm tắt văn bản**: {str(e)}"

    except Exception as e:
        logger.error(f"[TEXT_SUMMARY_TOOL] Tool error: {e}")
        return f"**Lỗi xử lý tóm tắt**: {str(e)}"


@tool
def risk_assessment_tool(query: str, file_data: Optional[Dict[str, Any]] = None) -> str:
    """
    Risk assessment tool - uses service directly (not routes)
    Preserves EXACT logic from risk_routes.py
    """
    try:
        logger.info(f"[RISK_TOOL] Processing: {query[:100]}...")

        # Import required models and services
        from app.multi_agent.models.risk import RiskAssessmentRequest
        from app.multi_agent.services.risk_service import assess_risk

        # Extract basic risk data from query
        financial_data = _extract_risk_data_from_query(query)

        # Extract text from file if provided
        if file_data and file_data.get('raw_bytes'):
            logger.info(f"[RISK_TOOL] Processing file: {file_data.get('filename')} ({len(file_data.get('raw_bytes', b''))} bytes)")

            try:
                # Extract text from file
                file_text = extract_text_from_file(file_data)
                financial_data['financial_documents'] = file_text
                logger.info(f"[RISK_TOOL] Extracted {len(file_text)} characters from file")

                if not file_text.strip():
                    logger.warning("[RISK_TOOL] No text extracted from file, proceeding with basic data")

            except Exception as file_error:
                logger.error(f"[RISK_TOOL] File processing error: {file_error}")
                return f"**Lỗi xử lý file**: {str(file_error)}"

        # Handle risk assessment with file content - use service directly
        async def call_service():
            # Create RiskAssessmentRequest object
            risk_request = RiskAssessmentRequest(
                entity_id=f"entity_{uuid4().hex[:8]}",
                entity_type="doanh nghiệp",
                financials=financial_data.get('financials', {}),
                market_data=financial_data.get('market_data', {}),
                custom_factors=financial_data.get('custom_factors', {}),
                applicant_name=financial_data.get('applicant_name', 'Khách hàng'),
                business_type=financial_data.get('business_type', 'general'),
                requested_amount=financial_data.get('requested_amount', 1000000000),
                currency=financial_data.get('currency', 'VND'),
                loan_term=financial_data.get('loan_term', 12),
                loan_purpose=financial_data.get('loan_purpose', 'Kinh doanh'),
                assessment_type="comprehensive",
                collateral_type=financial_data.get('collateral_type', 'Không tài sản đảm bảo'),
                financial_documents=financial_data.get('financial_documents', '')
            )

            # Call service directly (not route)
            return await assess_risk(risk_request)

        # Execute with proper async handling
        try:
            result = asyncio.run(call_service())
        except RuntimeError as e:
            if "cannot be called from a running event loop" in str(e):
                import concurrent.futures
                def run_in_thread():
                    return asyncio.run(call_service())
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(run_in_thread)
                    result = future.result(timeout=30)
            else:
                raise e

        logger.info("[RISK_TOOL] Successfully processed with service call")

        # Format response using EXACT endpoint result structure
        if result and isinstance(result, dict):
            data = result.get('data', {})
            
            response = f"""**Phân tích rủi ro - VPBank K-MULT**

**Thông tin đánh giá:**
• **Tên:** {financial_data.get('applicant_name', 'Chưa xác định')}
• **Số tiền:** {financial_data.get('requested_amount', 0):,} {financial_data.get('currency', 'VND')}
• **Loại hình:** {financial_data.get('business_type', 'Chưa xác định')}

**Kết quả phân tích:**
• **Điểm rủi ro:** {data.get('risk_score', 'N/A')}
• **Mức độ rủi ro:** {data.get('risk_level', 'N/A')}
• **Điểm tín dụng:** {data.get('credit_score', 'N/A')}

**Khuyến nghị:**
{data.get('recommendations', ['Cần đánh giá thêm'])[0] if data.get('recommendations') else 'Cần đánh giá thêm'}

**Báo cáo AI:**
{data.get('ai_report', 'Đang phân tích dữ liệu tài chính và đánh giá rủi ro...')}

**Thời gian xử lý:** {data.get('processing_time', 0):.1f}s

---

*VPBank K-MULT Agent Studio*
*{datetime.now().strftime('%d/%m/%Y %H:%M:%S')}*"""
        else:
            response = f"""**Phân tích rủi ro - VPBank K-MULT**

**Yêu cầu:** {query[:200]}...

**Phân tích sơ bộ:**
- Đang xử lý dữ liệu tài chính
- Áp dụng mô hình đánh giá rủi ro VPBank  
- Tuân thủ Basel III và quy định SBV

**Lưu ý:** Để có kết quả chính xác, vui lòng cung cấp:
• Tên khách hàng/doanh nghiệp
• Số tiền vay mong muốn
• Mục đích vay vốn
• Thông tin tài chính

---

*VPBank K-MULT Agent Studio*
*{datetime.now().strftime('%d/%m/%Y %H:%M:%S')}*"""
        
        logger.info("[RISK_TOOL] Successfully processed with DIRECT endpoint wrapper")
        return response
        
    except Exception as e:
        logger.error(f"[RISK_TOOL] Tool error: {str(e)}")
        return f"**Lỗi phân tích rủi ro**: {str(e)}"


def extract_text_from_file(file_data: Dict[str, Any]) -> str:
    """Extract text from uploaded file"""
    try:
        raw_bytes = file_data.get('raw_bytes')
        content_type = file_data.get('content_type', '')
        
        if content_type == "application/pdf":
            from app.multi_agent.helpers.improved_pdf_extractor import ImprovedPDFExtractor
            extractor = ImprovedPDFExtractor()
            result = extractor.extract_text_from_pdf(raw_bytes)
            return result.get('text', '').strip()
        elif content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
            import docx
            import io
            doc = docx.Document(io.BytesIO(raw_bytes))
            return "\n".join([paragraph.text for paragraph in doc.paragraphs])
        elif content_type.startswith("text/"):
            return raw_bytes.decode('utf-8')
        else:
            return ""
    except Exception as e:
        logger.error(f"Error extracting text from file: {e}")
        return ""

def _extract_risk_data_from_query(query: str) -> Dict[str, Any]:
    """Extract basic risk data from query - helper function"""
    import re
    
    financial_data = {
        'applicant_name': 'Khách hàng',
        'requested_amount': 1000000000,
        'business_type': 'general',
        'currency': 'VND',
        'loan_term': 12,
        'loan_purpose': 'Kinh doanh',
        'collateral_type': 'Không tài sản đảm bảo',
        # Required fields with proper structure
        'financials': {
            'revenue': 1000000000,
            'profit': 100000000,
            'assets': 2000000000,
            'liabilities': 500000000,
            'cash_flow': 300000000
        },
        'market_data': {
            'industry': 'general',
            'market_condition': 'stable',
            'competition_level': 'medium',
            'growth_potential': 'moderate'
        },
        'custom_factors': {
            'risk_tolerance': 'medium',
            'business_experience': 'established',
            'market_position': 'stable'
        }
    }
    
    try:
        # Extract amount (tỷ, triệu, etc.)
        amount_patterns = [
            r'(\d+(?:\.\d+)?)\s*tỷ',
            r'(\d+(?:\.\d+)?)\s*triệu',
            r'(\d+(?:,\d+)*)\s*VN[DĐ]',
            r'(\d+(?:,\d+)*)\s*đồng'
        ]
        
        for pattern in amount_patterns:
            match = re.search(pattern, query, re.IGNORECASE)
            if match:
                amount_str = match.group(1).replace(',', '')
                amount = float(amount_str)
                if 'tỷ' in match.group(0):
                    amount *= 1000000000
                elif 'triệu' in match.group(0):
                    amount *= 1000000
                financial_data['requested_amount'] = int(amount)
                break
        
        # Extract company name
        company_patterns = [
            r'công ty\s+([A-Za-z0-9\s]+)',
            r'doanh nghiệp\s+([A-Za-z0-9\s]+)',
            r'cho\s+([A-Za-z0-9\s]+)'
        ]
        
        for pattern in company_patterns:
            match = re.search(pattern, query, re.IGNORECASE)
            if match:
                financial_data['applicant_name'] = match.group(1).strip()
                break
        
    except Exception as e:
        logger.error(f"Error extracting risk data: {e}")
    
    return financial_data
