/**
 * Main entry point for @piotereks/parking-shared
 * Exports all utilities, adapters, and store factory
 */

// Core utilities
export * from './parkingUtils.js';
export * from './dateUtils.js';
export * from './dataTransforms.js';

// Store factory
export * from './store/createParkingStore.js';

// Adapter types and defaults
export * from './adapters/types.js';
