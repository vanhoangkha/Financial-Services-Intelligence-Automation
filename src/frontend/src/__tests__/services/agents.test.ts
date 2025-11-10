/**
 * Unit Tests for Agents API Service
 *
 * Tests the agent management API functionality
 */

import agentAPI from '../../services/api/agents';

// Mock fetch globally
global.fetch = jest.fn();

describe('Agents API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get agents list', async () => {
    const mockAgents = [
      { id: '1', name: 'Agent 1', type: 'text' },
      { id: '2', name: 'Agent 2', type: 'compliance' }
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'success',
        data: mockAgents
      })
    });

    const result = await agentAPI.getAgents();

    expect(result.status).toBe('success');
    expect(result.data).toEqual(mockAgents);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/agents')
    );
  });

  it('should create a new agent', async () => {
    const newAgent = { name: 'New Agent', type: 'text' };
    const createdAgent = { id: '3', ...newAgent };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'success',
        data: createdAgent
      })
    });

    const result = await agentAPI.createAgent(newAgent);

    expect(result.status).toBe('success');
    expect(result.data).toEqual(createdAgent);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/agents'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newAgent)
      })
    );
  });

  it('should update an agent', async () => {
    const agentId = '1';
    const updates = { name: 'Updated Name' };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'success',
        data: { id: agentId, ...updates }
      })
    });

    const result = await agentAPI.updateAgent(agentId, updates);

    expect(result.status).toBe('success');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/agents/${agentId}`),
      expect.objectContaining({
        method: 'PUT'
      })
    );
  });

  it('should delete an agent', async () => {
    const agentId = '1';

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'success'
      })
    });

    const result = await agentAPI.deleteAgent(agentId);

    expect(result.status).toBe('success');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/agents/${agentId}`),
      expect.objectContaining({
        method: 'DELETE'
      })
    );
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    await expect(agentAPI.getAgents()).rejects.toThrow('API Error');
  });
});
