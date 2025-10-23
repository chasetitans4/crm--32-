import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedContractInvoiceManager from '../EnhancedContractInvoiceManager.fixed';

describe('EnhancedContractInvoiceManager', () => {
  test('renders the component without errors', () => {
    render(<EnhancedContractInvoiceManager />);
    expect(screen.getByText('Contract & Invoice Manager')).toBeInTheDocument();
  });

  test('displays dashboard statistics correctly', () => {
    render(<EnhancedContractInvoiceManager />);
    expect(screen.getByText('Total Quotes')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Mock data has 2 quotes
  });

  test('allows navigating between tabs', () => {
    render(<EnhancedContractInvoiceManager />);
    fireEvent.click(screen.getByText('Quote Conversion'));
    expect(screen.getByText('Quote to Contract Conversion')).toBeInTheDocument();
  });

  test('opens the conversion modal when a quote is selected', () => {
    render(<EnhancedContractInvoiceManager />);
    fireEvent.click(screen.getByText('Quote Conversion'));
    fireEvent.click(screen.getAllByText('Convert')[0]);
    expect(screen.getByText(/Convert Quote to Contract/)).toBeInTheDocument();
  });
});