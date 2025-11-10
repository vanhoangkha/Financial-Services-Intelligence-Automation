"""
Message Bus for inter-agent communication.

Implements publish-subscribe pattern for asynchronous agent messaging.
"""

from typing import Dict, List, Callable, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
import asyncio
import logging

logger = logging.getLogger(__name__)


class AgentMessage(BaseModel):
    """Message passed between agents"""
    message_id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    from_agent: str = Field(..., description="Source agent name")
    to_agent: str = Field(..., description="Destination agent name")
    message_type: str = Field(..., description="Type of message")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Message data")
    timestamp: datetime = Field(default_factory=datetime.now)
    priority: int = Field(default=0, description="Message priority (higher = more urgent)")
    reply_to: Optional[str] = Field(default=None, description="Message ID being replied to")


class MessageBus:
    """
    Asynchronous message bus for agent communication.

    Supports pub-sub pattern with topic-based routing.
    """

    def __init__(self):
        """Initialize the message bus."""
        self.subscribers: Dict[str, List[Callable]] = {}
        self.message_history: List[AgentMessage] = []
        self.logger = logging.getLogger("message_bus")

    async def publish(self, message: AgentMessage) -> None:
        """
        Publish a message to the bus.

        Args:
            message: Message to publish
        """
        self.logger.info(
            f"Publishing message: {message.from_agent} -> {message.to_agent} "
            f"(type: {message.message_type})"
        )

        # Store in history
        self.message_history.append(message)

        # Deliver to subscribers
        topic = f"{message.to_agent}.{message.message_type}"
        if topic in self.subscribers:
            for callback in self.subscribers[topic]:
                try:
                    await callback(message)
                except Exception as e:
                    self.logger.error(f"Error in message handler: {str(e)}")

        # Also deliver to wildcard subscribers
        wildcard_topic = f"{message.to_agent}.*"
        if wildcard_topic in self.subscribers:
            for callback in self.subscribers[wildcard_topic]:
                try:
                    await callback(message)
                except Exception as e:
                    self.logger.error(f"Error in wildcard handler: {str(e)}")

    def subscribe(
        self,
        agent_name: str,
        message_type: str,
        callback: Callable[[AgentMessage], None]
    ) -> None:
        """
        Subscribe to messages for an agent.

        Args:
            agent_name: Name of agent to receive messages for
            message_type: Type of messages to receive (use '*' for all)
            callback: Async function to call when message received
        """
        topic = f"{agent_name}.{message_type}"

        if topic not in self.subscribers:
            self.subscribers[topic] = []

        self.subscribers[topic].append(callback)
        self.logger.info(f"Subscribed to topic: {topic}")

    def unsubscribe(
        self,
        agent_name: str,
        message_type: str,
        callback: Callable[[AgentMessage], None]
    ) -> None:
        """
        Unsubscribe from messages.

        Args:
            agent_name: Agent name
            message_type: Message type
            callback: Callback to remove
        """
        topic = f"{agent_name}.{message_type}"

        if topic in self.subscribers:
            if callback in self.subscribers[topic]:
                self.subscribers[topic].remove(callback)
                self.logger.info(f"Unsubscribed from topic: {topic}")

    def get_message_history(
        self,
        agent_name: Optional[str] = None,
        limit: int = 100
    ) -> List[AgentMessage]:
        """
        Get message history.

        Args:
            agent_name: Filter by agent name (None for all)
            limit: Maximum messages to return

        Returns:
            List of messages
        """
        if agent_name:
            filtered = [
                msg for msg in self.message_history
                if msg.from_agent == agent_name or msg.to_agent == agent_name
            ]
            return filtered[-limit:]
        else:
            return self.message_history[-limit:]
