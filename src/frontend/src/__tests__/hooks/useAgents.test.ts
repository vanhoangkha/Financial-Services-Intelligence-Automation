/**
 * Unit Tests for useAgents Hook
 *
 * Tests agent management functionality including:
 * - Fetching agents list
 * - Creating agents
 * - Updating agents
 * - Deleting agents
 * - Selecting agents
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useAgents } from '../../hooks/useAgents';
import agentAPI from '../../services/api/agents';

// Mock the agent API
jest.mock('../../services/api/agents');

describe('useAgents Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch agents on mount', async () => {
    const mockAgents = [
      { id: '1', name: 'Agent 1', type: 'text', status: 'active' },
      { id: '2', name: 'Agent 2', type: 'compliance', status: 'active' }
    ];

    (agentAPI.getAgents as jest.Mock).mockResolvedValue({
      status: 'success',
      data: mockAgents
    });

    const { result } = renderHook(() => useAgents());

    // Initially loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.agents).toEqual(mockAgents);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    (agentAPI.getAgents as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    const { result } = renderHook(() => useAgents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch');
    expect(result.current.agents).toEqual([]);
  });

  it('should create a new agent', async () => {
    const newAgent = { name: 'New Agent', type: 'text' };
    const createdAgent = { id: '3', ...newAgent, status: 'active' };

    (agentAPI.getAgents as jest.Mock).mockResolvedValue({
      status: 'success',
      data: []
    });

    (agentAPI.createAgent as jest.Mock).mockResolvedValue({
      status: 'success',
      data: createdAgent
    });

    const { result } = renderHook(() => useAgents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const created = await result.current.createAgent(newAgent);

    expect(created).toEqual(createdAgent);
    expect(agentAPI.createAgent).toHaveBeenCalledWith(newAgent);
  });

  it('should update an agent', async () => {
    const updatedData = { name: 'Updated Name' };

    (agentAPI.getAgents as jest.Mock).mockResolvedValue({
      status: 'success',
      data: []
    });

    (agentAPI.updateAgent as jest.Mock).mockResolvedValue({
      status: 'success',
      data: { id: '1', ...updatedData }
    });

    const { result } = renderHook(() => useAgents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.updateAgent('1', updatedData);

    expect(agentAPI.updateAgent).toHaveBeenCalledWith('1', updatedData);
  });

  it('should delete an agent', async () => {
    (agentAPI.getAgents as jest.Mock).mockResolvedValue({
      status: 'success',
      data: []
    });

    (agentAPI.deleteAgent as jest.Mock).mockResolvedValue({
      status: 'success'
    });

    const { result } = renderHook(() => useAgents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.deleteAgent('1');

    expect(agentAPI.deleteAgent).toHaveBeenCalledWith('1');
  });

  it('should select an agent', async () => {
    const mockAgents = [
      { id: '1', name: 'Agent 1', type: 'text', status: 'active' },
      { id: '2', name: 'Agent 2', type: 'compliance', status: 'active' }
    ];

    (agentAPI.getAgents as jest.Mock).mockResolvedValue({
      status: 'success',
      data: mockAgents
    });

    const { result } = renderHook(() => useAgents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.selectAgent('2');

    expect(result.current.selectedAgent).toEqual(mockAgents[1]);
  });
});
