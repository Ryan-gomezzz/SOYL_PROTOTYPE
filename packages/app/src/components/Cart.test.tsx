import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from './Cart';

// Mock the API module
vi.mock('../lib/auth', () => ({
  getCurrentUser: () => ({
    id: 'test-user',
    email: 'test@soyl.com',
    role: 'user',
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('Cart Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderCart = (props = { isOpen: true, onClose: vi.fn() }) => {
    return render(
      <BrowserRouter>
        <Cart {...props} />
      </BrowserRouter>
    );
  };

  it('should render empty cart message when no items', () => {
    renderCart();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should display cart items when items exist', () => {
    localStorage.setItem('soyl_cart', JSON.stringify([{
      id: 'item-1',
      productId: 'prod-1',
      name: 'Test Product',
      price: 99.99,
      quantity: 2,
      priceAtAdd: 99.99
    }]));

    renderCart();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = renderCart({ isOpen: true, onClose });
    
    const backdrop = container.querySelector('.backdrop-blur-sm');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('should update quantity when buttons are clicked', async () => {
    localStorage.setItem('soyl_cart', JSON.stringify([{
      id: 'item-1',
      productId: 'prod-1',
      name: 'Test Product',
      price: 99.99,
      quantity: 1,
      priceAtAdd: 99.99
    }]));

    renderCart();
    
    const plusButton = screen.getByLabelText('Increase quantity');
    fireEvent.click(plusButton);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});

