import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import axios, { csrf } from '@/lib/axios';

import Login from './login';

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: { data: undefined } }),
    post: jest.fn(),
  },
  csrf: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
  Toaster: () => null,
}));

// eslint-disable-next-line global-require
const { toast } = jest.requireMock('sonner');

describe('Login page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (csrf as jest.Mock).mockResolvedValue(undefined);
  });

  it('shows an error toast when login fails with a 422', async () => {
    (axios.post as jest.Mock).mockRejectedValue({
      response: {
        status: 422,
        data: { errors: [{ detail: 'Invalid credentials' }] },
      },
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'a@a.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong, please try again!',
      ),
    );
  });

  it('does not show an error toast when login succeeds', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: { data: {} } });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'a@a.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'correct-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(toast.error).not.toHaveBeenCalled();
  });
});
