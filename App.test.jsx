import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';

describe('App', () => {
  it('renders navbar', () => {
    render(<App />);
    expect(screen.getByText('Catálogo VW')).toBeInTheDocument();
  });
});