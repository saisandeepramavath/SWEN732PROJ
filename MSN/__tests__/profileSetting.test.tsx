import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ProfileSettings from '../app/profilesettings';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Mock Firebase Auth
jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: { uid: 'testUserId' },
  })),
}));

// Mock Firestore
jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(async () => ({
          exists: true,
          data: jest.fn(() => ({ name: 'John Doe', email: 'john@example.com' })), // Changed from fullName to name
        })),
        update: jest.fn(async () => Promise.resolve()),
      })),
    })),
  })),
}));

describe('ProfileSettings Component', () => {
  it('renders loading state', async () => {
    const { getByTestId } = render(<ProfileSettings />);

    // Verify the loading indicator is displayed
    await waitFor(() => expect(getByTestId('loading-indicator')).toBeTruthy());
  });

  it('displays user data after fetching', async () => {
    const { getByText, getByTestId } = render(<ProfileSettings />);

    await waitFor(() => expect(getByText('Profile Settings')).toBeTruthy());

    const nameInput = getByTestId('name-input'); // Use testID to locate the name input
    const emailInput = getByTestId('email-input'); // Use testID to locate the email input

    expect(nameInput.props.value).toBe('John Doe'); // Verify the value of the name input
    expect(emailInput.props.value).toBe('john@example.com'); // Verify the value of the email input
  });

  it('handles errors during data fetching', async () => {
    (firestore().collection('users').doc().get as jest.Mock).mockRejectedValueOnce(new Error('Fetch error'));

    const { getByTestId } = render(<ProfileSettings />);

    await waitFor(() =>
      expect(getByTestId('error-message')).toHaveTextContent('Failed to fetch user data')
    );
  });


  it('handles errors during profile update', async () => {
    (firestore().collection('users').doc().update as jest.Mock).mockRejectedValueOnce(new Error('Update error'));

    const { getByText, getByDisplayValue, getByTestId } = render(<ProfileSettings />);

    await waitFor(() => expect(getByText('Profile Settings')).toBeTruthy());

    const nameInput = getByDisplayValue('John Doe');
    act(() => {
      fireEvent.changeText(nameInput, 'Jane Doe');
    });

    const updateButton = getByText('Update Profile');
    act(() => {
      fireEvent.press(updateButton);
    });

    await waitFor(() =>
      expect(getByTestId('error-message')).toHaveTextContent('Failed to update profile')
    );
  });
});
