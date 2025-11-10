"""
Base Agent class for all domain-specific agents.

Provides the core interface and functionality that all agents must implement.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class AgentState(str, Enum):
    """Agent execution states"""
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AgentConfig(BaseModel):
    """Configuration for agent instances"""
    name: str = Field(..., description="Unique agent name")
    description: str = Field(..., description="Agent purpose and capabilities")
    max_iterations: int = Field(default=10, description="Maximum execution iterations")
    timeout_seconds: int = Field(default=300, description="Execution timeout")
    enable_memory: bool = Field(default=True, description="Enable agent memory")
    enable_tools: bool = Field(default=True, description="Enable tool usage")
    verbose: bool = Field(default=False, description="Verbose logging")

    # BFSI specific
    compliance_mode: bool = Field(default=True, description="Enforce compliance checks")
    audit_trail: bool = Field(default=True, description="Enable audit logging")
    encryption_required: bool = Field(default=True, description="Require data encryption")


class AgentMetrics(BaseModel):
    """Agent performance metrics"""
    total_executions: int = 0
    successful_executions: int = 0
    failed_executions: int = 0
    average_execution_time: float = 0.0
    total_execution_time: float = 0.0
    last_execution_time: Optional[datetime] = None


class BaseAgent(ABC):
    """
    Abstract base class for all agents in the multi-agent system.

    All domain-specific agents must inherit from this class and implement
    the required abstract methods.
    """

    def __init__(self, config: AgentConfig):
        """
        Initialize the base agent.

        Args:
            config: Agent configuration
        """
        self.config = config
        self.state = AgentState.IDLE
        self.metrics = AgentMetrics()
        self.logger = logging.getLogger(f"agent.{config.name}")

        # Agent memory (shared context)
        self._memory: Dict[str, Any] = {}

        # Agent tools
        self._tools: List[Any] = []

        self.logger.info(f"Initialized agent: {config.name}")

    @abstractmethod
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent's main task.

        This is the primary method that must be implemented by all agents.

        Args:
            task: Task specification with input data and parameters

        Returns:
            Dict containing execution results

        Raises:
            AgentExecutionError: If execution fails
        """
        pass

    @abstractmethod
    async def plan(self, task: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Create an execution plan for the given task.

        Args:
            task: Task specification

        Returns:
            List of planned steps/actions
        """
        pass

    async def validate_input(self, task: Dict[str, Any]) -> bool:
        """
        Validate input task data.

        Args:
            task: Task to validate

        Returns:
            True if valid, False otherwise
        """
        required_fields = ["task_id", "task_type", "input_data"]

        for field in required_fields:
            if field not in task:
                self.logger.error(f"Missing required field: {field}")
                return False

        return True

    async def pre_execute(self, task: Dict[str, Any]) -> None:
        """
        Pre-execution hook. Called before execute().

        Args:
            task: Task to be executed
        """
        self.state = AgentState.RUNNING
        self.logger.info(f"Pre-execution: {task.get('task_id')}")

        if self.config.audit_trail:
            await self._log_audit_event("pre_execute", task)

    async def post_execute(self, task: Dict[str, Any], result: Dict[str, Any]) -> None:
        """
        Post-execution hook. Called after execute().

        Args:
            task: Executed task
            result: Execution result
        """
        self.state = AgentState.COMPLETED
        self.logger.info(f"Post-execution: {task.get('task_id')}")

        # Update metrics
        self.metrics.total_executions += 1
        self.metrics.successful_executions += 1
        self.metrics.last_execution_time = datetime.now()

        if self.config.audit_trail:
            await self._log_audit_event("post_execute", {"task": task, "result": result})

    async def on_error(self, task: Dict[str, Any], error: Exception) -> None:
        """
        Error handler. Called when execution fails.

        Args:
            task: Failed task
            error: Exception that occurred
        """
        self.state = AgentState.FAILED
        self.logger.error(f"Execution failed: {str(error)}", exc_info=True)

        # Update metrics
        self.metrics.total_executions += 1
        self.metrics.failed_executions += 1

        if self.config.audit_trail:
            await self._log_audit_event("error", {
                "task": task,
                "error": str(error),
                "error_type": type(error).__name__
            })

    async def add_memory(self, key: str, value: Any) -> None:
        """
        Add data to agent memory.

        Args:
            key: Memory key
            value: Data to store
        """
        if self.config.enable_memory:
            self._memory[key] = value
            self.logger.debug(f"Added to memory: {key}")

    async def get_memory(self, key: str) -> Optional[Any]:
        """
        Retrieve data from agent memory.

        Args:
            key: Memory key

        Returns:
            Stored data or None if not found
        """
        return self._memory.get(key)

    async def clear_memory(self) -> None:
        """Clear all agent memory."""
        self._memory.clear()
        self.logger.debug("Memory cleared")

    def register_tool(self, tool: Any) -> None:
        """
        Register a tool for the agent to use.

        Args:
            tool: Tool instance
        """
        if self.config.enable_tools:
            self._tools.append(tool)
            self.logger.info(f"Registered tool: {getattr(tool, 'name', 'unknown')}")

    def get_tools(self) -> List[Any]:
        """
        Get all registered tools.

        Returns:
            List of tool instances
        """
        return self._tools

    async def _log_audit_event(self, event_type: str, data: Dict[str, Any]) -> None:
        """
        Log audit event for compliance.

        Args:
            event_type: Type of event
            data: Event data
        """
        audit_entry = {
            "timestamp": datetime.now().isoformat(),
            "agent_name": self.config.name,
            "event_type": event_type,
            "data": data
        }

        # In production, this should write to a secure audit log
        self.logger.info(f"AUDIT: {audit_entry}")

    def get_status(self) -> Dict[str, Any]:
        """
        Get current agent status.

        Returns:
            Dict with agent status information
        """
        return {
            "name": self.config.name,
            "state": self.state.value,
            "metrics": self.metrics.dict(),
            "memory_size": len(self._memory),
            "tools_count": len(self._tools)
        }

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(name={self.config.name}, state={self.state.value})>"
