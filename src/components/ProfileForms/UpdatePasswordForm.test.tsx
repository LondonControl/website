import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import axios, { csrf } from '@/lib/axios';
import UpdatePasswordForm from './UpdatePasswordForm';

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: { put: jest.fn() },
  csrf: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

// eslint-disable-next-line global-require
const { toast } = jest.requireMock('sonner');

describe('UpdatePasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (csrf as jest.Mock).mockResolvedValue(undefined);
  });

  const fillAndSubmit = () => {
    const [currentPassword, newPassword, confirmPassword] =
      screen.getAllByPlaceholderText('••••••••');

    fireEvent.change(currentPassword!, { target: { value: 'oldpass123' } });
    fireEvent.change(newPassword!, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPassword!, { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
  };

  it('shows a success toast and does not show an error toast on success', async () => {
    (axios.put as jest.Mock).mockResolvedValue({ data: {} });

    render(<UpdatePasswordForm />);
    fillAndSubmit();

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Password updated successfully!'),
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows an error toast on a 422 and does not show a success toast', async () => {
    (axios.put as jest.Mock).mockRejectedValue({
      response: { status: 422, data: { errors: [{ detail: 'Current password is incorrect' }] } },
    });

    render(<UpdatePasswordForm />);
    fillAndSubmit();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong, please try again!',
      ),
    );
    expect(toast.success).not.toHaveBeenCalled();
  });
});
