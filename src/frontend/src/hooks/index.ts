/**
 * Custom Hooks - Central Export
 *
 * Provides easy access to all custom hooks from a single import.
 *
 * @example
 * import { useApi, useAgents, useCompliance } from './hooks';
 */

export { useApi } from './useApi';
export { useAgents } from './useAgents';
export { useCompliance } from './useCompliance';
export { useFileUpload } from './useFileUpload';

// Default export for convenience
export default {
  useApi: require('./useApi').useApi,
  useAgents: require('./useAgents').useAgents,
  useCompliance: require('./useCompliance').useCompliance,
  useFileUpload: require('./useFileUpload').useFileUpload,
};
