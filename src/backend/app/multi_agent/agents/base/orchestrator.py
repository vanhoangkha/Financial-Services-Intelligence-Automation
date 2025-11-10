"""
Multi-Agent Orchestrator

Coordinates multiple agents to work together on complex tasks.
Implements various orchestration patterns (sequential, parallel, hierarchical).
"""

from typing import Dict, List, Any, Optional
from enum import Enum
import asyncio
import logging
from datetime import datetime
from pydantic import BaseModel

from .agent import BaseAgent, AgentState

logger = logging.getLogger(__name__)


class OrchestrationPattern(str, Enum):
    """Orchestration execution patterns"""
    SEQUENTIAL = "sequential"  # Agents execute in sequence
    PARALLEL = "parallel"  # Agents execute in parallel
    HIERARCHICAL = "hierarchical"  # Supervisor coordinates sub-agents
    DYNAMIC = "dynamic"  # Pattern determined at runtime


class WorkflowStep(BaseModel):
    """A single step in a workflow"""
    step_id: str
    agent_name: str
    input_mapping: Dict[str, str] = {}  # Map previous outputs to inputs
    condition: Optional[str] = None  # Conditional execution
    timeout: int = 300


class Workflow(BaseModel):
    """Workflow definition"""
    workflow_id: str
    name: str
    description: str
    pattern: OrchestrationPattern
    steps: List[WorkflowStep]
    max_retries: int = 3
    enable_rollback: bool = True


class MultiAgentOrchestrator:
    """
    Orchestrates multiple agents to work together on complex tasks.

    Supports different orchestration patterns:
    - Sequential: Agents execute one after another
    - Parallel: Multiple agents execute simultaneously
    - Hierarchical: Supervisor agent coordinates sub-agents
    - Dynamic: Orchestration pattern determined at runtime
    """

    def __init__(self):
        """Initialize the orchestrator."""
        self.agents: Dict[str, BaseAgent] = {}
        self.workflows: Dict[str, Workflow] = {}
        self.execution_history: List[Dict[str, Any]] = []
        self.logger = logging.getLogger("orchestrator")

    def register_agent(self, agent: BaseAgent) -> None:
        """
        Register an agent with the orchestrator.

        Args:
            agent: Agent instance to register
        """
        agent_name = agent.config.name
        self.agents[agent_name] = agent
        self.logger.info(f"Registered agent: {agent_name}")

    def register_workflow(self, workflow: Workflow) -> None:
        """
        Register a workflow definition.

        Args:
            workflow: Workflow to register
        """
        self.workflows[workflow.workflow_id] = workflow
        self.logger.info(f"Registered workflow: {workflow.name}")

    async def execute_workflow(
        self,
        workflow_id: str,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a registered workflow.

        Args:
            workflow_id: ID of workflow to execute
            input_data: Input data for the workflow

        Returns:
            Workflow execution results

        Raises:
            ValueError: If workflow not found
        """
        if workflow_id not in self.workflows:
            raise ValueError(f"Workflow not found: {workflow_id}")

        workflow = self.workflows[workflow_id]
        self.logger.info(f"Executing workflow: {workflow.name} ({workflow.pattern.value})")

        start_time = datetime.now()

        try:
            # Execute based on pattern
            if workflow.pattern == OrchestrationPattern.SEQUENTIAL:
                result = await self._execute_sequential(workflow, input_data)
            elif workflow.pattern == OrchestrationPattern.PARALLEL:
                result = await self._execute_parallel(workflow, input_data)
            elif workflow.pattern == OrchestrationPattern.HIERARCHICAL:
                result = await self._execute_hierarchical(workflow, input_data)
            else:
                result = await self._execute_dynamic(workflow, input_data)

            # Record execution
            execution_time = (datetime.now() - start_time).total_seconds()
            self._record_execution(workflow_id, input_data, result, execution_time, success=True)

            return result

        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            self._record_execution(workflow_id, input_data, {}, execution_time, success=False, error=str(e))
            raise

    async def _execute_sequential(
        self,
        workflow: Workflow,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute workflow steps sequentially.

        Each step receives the output of the previous step as input.

        Args:
            workflow: Workflow definition
            input_data: Initial input data

        Returns:
            Final step output
        """
        self.logger.info(f"Sequential execution: {workflow.name}")

        current_data = input_data
        results = {}

        for step in workflow.steps:
            self.logger.info(f"Executing step: {step.step_id} (agent: {step.agent_name})")

            # Get agent
            agent = self.agents.get(step.agent_name)
            if not agent:
                raise ValueError(f"Agent not found: {step.agent_name}")

            # Map inputs from previous outputs
            step_input = self._map_inputs(step, current_data, results)

            # Execute agent
            try:
                step_output = await asyncio.wait_for(
                    agent.execute(step_input),
                    timeout=step.timeout
                )
                results[step.step_id] = step_output
                current_data = step_output

            except asyncio.TimeoutError:
                self.logger.error(f"Step {step.step_id} timed out")
                raise
            except Exception as e:
                self.logger.error(f"Step {step.step_id} failed: {str(e)}")
                raise

        return current_data

    async def _execute_parallel(
        self,
        workflow: Workflow,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute workflow steps in parallel.

        All steps execute simultaneously with the same input.

        Args:
            workflow: Workflow definition
            input_data: Input data for all steps

        Returns:
            Combined results from all steps
        """
        self.logger.info(f"Parallel execution: {workflow.name}")

        tasks = []
        step_names = []

        for step in workflow.steps:
            agent = self.agents.get(step.agent_name)
            if not agent:
                raise ValueError(f"Agent not found: {step.agent_name}")

            # Create task for each agent
            task = asyncio.create_task(
                asyncio.wait_for(
                    agent.execute(input_data),
                    timeout=step.timeout
                )
            )
            tasks.append(task)
            step_names.append(step.step_id)

        # Wait for all tasks to complete
        results_list = await asyncio.gather(*tasks, return_exceptions=True)

        # Combine results
        combined_results = {}
        for step_id, result in zip(step_names, results_list):
            if isinstance(result, Exception):
                self.logger.error(f"Step {step_id} failed: {str(result)}")
                combined_results[step_id] = {"error": str(result)}
            else:
                combined_results[step_id] = result

        return combined_results

    async def _execute_hierarchical(
        self,
        workflow: Workflow,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute workflow with hierarchical supervision.

        First step is supervisor agent that coordinates sub-agents.

        Args:
            workflow: Workflow definition
            input_data: Input data

        Returns:
            Supervisor's final output
        """
        self.logger.info(f"Hierarchical execution: {workflow.name}")

        if not workflow.steps:
            raise ValueError("No steps defined in workflow")

        # First agent is the supervisor
        supervisor_step = workflow.steps[0]
        supervisor = self.agents.get(supervisor_step.agent_name)

        if not supervisor:
            raise ValueError(f"Supervisor agent not found: {supervisor_step.agent_name}")

        # Execute supervisor (it will coordinate sub-agents)
        result = await asyncio.wait_for(
            supervisor.execute(input_data),
            timeout=supervisor_step.timeout
        )

        return result

    async def _execute_dynamic(
        self,
        workflow: Workflow,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute workflow with dynamic orchestration.

        Orchestration pattern determined at runtime based on task.

        Args:
            workflow: Workflow definition
            input_data: Input data

        Returns:
            Execution results
        """
        self.logger.info(f"Dynamic execution: {workflow.name}")

        # Analyze task to determine best pattern
        task_type = input_data.get("task_type", "")

        if "parallel" in task_type.lower():
            return await self._execute_parallel(workflow, input_data)
        else:
            return await self._execute_sequential(workflow, input_data)

    def _map_inputs(
        self,
        step: WorkflowStep,
        current_data: Dict[str, Any],
        previous_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Map inputs from previous step outputs.

        Args:
            step: Current step
            current_data: Data from previous step
            previous_results: All previous results

        Returns:
            Mapped input data for current step
        """
        step_input = current_data.copy()

        # Apply input mapping
        for target_key, source_key in step.input_mapping.items():
            if "." in source_key:  # Reference to previous step: step_id.field
                step_id, field = source_key.split(".", 1)
                if step_id in previous_results:
                    value = previous_results[step_id].get(field)
                    if value is not None:
                        step_input[target_key] = value

        return step_input

    def _record_execution(
        self,
        workflow_id: str,
        input_data: Dict[str, Any],
        result: Dict[str, Any],
        execution_time: float,
        success: bool,
        error: Optional[str] = None
    ) -> None:
        """
        Record workflow execution for audit and analytics.

        Args:
            workflow_id: Executed workflow ID
            input_data: Input data
            result: Execution result
            execution_time: Execution duration in seconds
            success: Whether execution succeeded
            error: Error message if failed
        """
        record = {
            "workflow_id": workflow_id,
            "timestamp": datetime.now().isoformat(),
            "execution_time": execution_time,
            "success": success,
            "error": error,
            "input_data": input_data,
            "result": result if success else {}
        }

        self.execution_history.append(record)

        # Keep only last 1000 executions
        if len(self.execution_history) > 1000:
            self.execution_history = self.execution_history[-1000:]

    def get_execution_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get execution history.

        Args:
            limit: Maximum number of records to return

        Returns:
            List of execution records
        """
        return self.execution_history[-limit:]

    def get_agent_status(self) -> Dict[str, Any]:
        """
        Get status of all registered agents.

        Returns:
            Dict with agent statuses
        """
        return {
            name: agent.get_status()
            for name, agent in self.agents.items()
        }
