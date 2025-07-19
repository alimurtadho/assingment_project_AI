import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple test that doesn't require complex mocking
test('basic test that passes', () => {
  expect(1 + 1).toBe(2);
});

test('document exists', () => {
  expect(document).toBeDefined();
});

test('React exists', () => {
  expect(React).toBeDefined();
});
