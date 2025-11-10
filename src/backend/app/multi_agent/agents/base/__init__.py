"""
Base agent classes and interfaces for the multi-agent system.

This module provides the foundation for all domain-specific agents,
including base agent classes, coordinator, and orchestrator.
"""

from .agent import BaseAgent, AgentConfig, AgentState
from .coordinator import AgentCoordinator
from .orchestrator import MultiAgentOrchestrator

__all__ = [
    "BaseAgent",
    "AgentConfig",
    "AgentState",
    "AgentCoordinator",
    "MultiAgentOrchestrator",
]
