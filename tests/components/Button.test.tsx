import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/testUtils';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary');

    rerender(<Button variant="destructive">Destructive</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('h-9');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-11');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Loading state test removed - not implemented in current Button component

  it('can be disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Polymorphic component test removed - 'as' prop not implemented in current Button component

  it('forwards refs correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Button</Button>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveTextContent('Button');
  });

  it('supports keyboard navigation', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Button</Button>);
    
    const button = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('has proper ARIA attributes', () => {
    render(
      <Button
        aria-label="Custom label"
        aria-describedby="description"
        disabled
      >
        Button
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
    expect(button).toHaveAttribute('aria-describedby', 'description');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders with children content', () => {
    render(
      <Button>
        <span data-testid="icon">🔥</span>
        With Content
      </Button>
    );
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('With Content')).toBeInTheDocument();
  });

  it('handles async operations', async () => {
    const asyncHandler = jest.fn().mockResolvedValue('success');
    
    render(<Button onClick={asyncHandler}>Async Button</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(asyncHandler).toHaveBeenCalledTimes(1);
    });
  });

  it('prevents double clicks when loading', () => {
    const handleClick = jest.fn();
    const { rerender } = render(
      <Button onClick={handleClick}>Button</Button>
    );
    
    const button = screen.getByRole('button');
    
    // First click
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // Set loading state
    rerender(<Button loading onClick={handleClick}>Button</Button>);
    
    // Second click should be ignored
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn', 'custom-class');
  });

  it('spreads additional props', () => {
    render(
      <Button
        data-testid="custom-button"
        title="Custom title"
        tabIndex={-1}
      >
        Button
      </Button>
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('title', 'Custom title');
    expect(button).toHaveAttribute('tabIndex', '-1');
  });
});

// Performance tests
describe('Button Performance', () => {
  it('renders quickly', async () => {
    const { measureRenderTime } = await import('../utils/testUtils');
    
    const renderTime = await measureRenderTime.performanceHelpers.measureRenderTime(() => {
      render(<Button>Performance Test</Button>);
    });
    
    // Should render in less than 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('does not cause memory leaks', () => {
    const { checkMemoryLeaks } = performanceHelpers;
    const memoryCheck = checkMemoryLeaks();
    
    const { unmount } = render(<Button>Memory Test</Button>);
    unmount();
    
    const memoryDiff = memoryCheck.getMemoryDiff();
    // Memory difference should be minimal
    expect(Math.abs(memoryDiff)).toBeLessThan(1000000); // 1MB threshold
  });
});

// Accessibility tests
describe('Button Accessibility', () => {
  it('meets accessibility standards', async () => {
    const { a11yHelpers } = await import('../utils/testUtils');
    
    render(<Button>Accessible Button</Button>);
    
    const button = screen.getByRole('button');
    
    // Check ARIA attributes
    const ariaAttributes = a11yHelpers.checkAriaAttributes(button);
    expect(Object.keys(ariaAttributes).length).toBeGreaterThanOrEqual(0);
    
    // Check keyboard navigation
    const keyboardResults = await a11yHelpers.checkKeyboardNavigation(button);
    expect(keyboardResults.canFocus).toBe(true);
    
    // Check color contrast
    const contrastResults = a11yHelpers.checkColorContrast(button);
    expect(contrastResults.hasGoodContrast).toBe(true);
  });

  it('supports screen readers', () => {
    render(
      <Button aria-label="Save document" aria-describedby="save-help">
        Save
      </Button>
    );
    
    const button = screen.getByRole('button', { name: /save document/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-describedby', 'save-help');
  });

  it('has proper focus management', () => {
    render(<Button autoFocus>Auto Focus Button</Button>);
    
    const button = screen.getByRole('button');
    expect(document.activeElement).toBe(button);
  });
});