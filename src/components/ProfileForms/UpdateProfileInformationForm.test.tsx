import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import axios, { csrf } from '@/lib/axios';
import UpdateProfileInformationForm from './UpdateProfileInformationForm';

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: { put: jest.fn() },
  csrf: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test', email: 'test@example.com' },
  }),
}));

// eslint-disable-next-line global-require
const { toast } = jest.requireMock('sonner');

describe('UpdateProfileInformationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (csrf as jest.Mock).mockResolvedValue(undefined);
  });

  const submit = () => {
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
  };

  it('shows a success toast and does not show an error toast on success', async () => {
    (axios.put as jest.Mock).mockResolvedValue({ data: {} });

    render(<UpdateProfileInformationForm />);

    await waitFor(() =>
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument(),
    );

    submit();

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully!'),
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows an error toast on a 422 and does not show a success toast', async () => {
    (axios.put as jest.Mock).mockRejectedValue({
      response: { status: 422, data: { errors: [{ detail: 'Invalid profile' }] } },
    });

    render(<UpdateProfileInformationForm />);

    await waitFor(() =>
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument(),
    );

    submit();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong, please try again!',
      ),
    );
    expect(toast.success).not.toHaveBeenCalled();
  });
});
