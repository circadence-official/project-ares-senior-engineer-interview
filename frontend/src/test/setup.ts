import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.history.back
Object.defineProperty(window, 'history', {
  value: {
    back: vi.fn(),
  },
  writable: true,
});

// Mock window.location.href
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

// Mock confirm dialog
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  writable: true,
});
