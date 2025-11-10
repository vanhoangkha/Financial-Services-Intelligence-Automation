"""
Inter-agent communication module.

Provides message bus, event management, and protocols for agents to communicate.
"""

from .message_bus import MessageBus, AgentMessage
from .events import EventManager, Event
from .protocols import CommunicationProtocol

__all__ = [
    "MessageBus",
    "AgentMessage",
    "EventManager",
    "Event",
    "CommunicationProtocol",
]
