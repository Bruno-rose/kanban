import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({
  asyncUtilTimeout: 2000,
  testIdAttribute: 'data-testid',
});

// Mock window.alert
window.alert = jest.fn();

// Silence React act() warnings for async operations
const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};