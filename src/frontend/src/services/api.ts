// API Service - Backward Compatibility Layer
// This file re-exports from the new modular API structure

// Re-export everything from the new modular API
export * from './api/index';

// Ensure default export works
export { default } from './api/index';
