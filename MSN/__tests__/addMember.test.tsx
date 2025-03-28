import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AddGroupMembers from '../app/(modal)/addMember';
import firestore from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

// Mock @expo/vector-icons to avoid native font loading issues
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  Entypo: 'Entypo',
  FontAwesome: 'FontAwesome',
  MaterialIcons: 'MaterialIcons',
}));

// Mock Firebase Auth to simulate a logged-in user
jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'testUserId' }, // Mocked current user ID
  })),
}));

// Mock Firebase Firestore to simulate fetching friends data
jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          get: jest.fn(async () => ({
            docs: [
              // Mocked friends data
              { id: '1', data: () => ({ name: 'John Doe', email: 'john@example.com', number: '1234567890' }) },
              { id: '2', data: () => ({ name: 'Jane Smith', email: 'jane@example.com', number: '0987654321' }) },
            ],
          })),
        })),
      })),
    })),
  })),
}));

describe('AddGroupMembers Component', () => {
  it('renders the component and fetches friends', async () => {
    const { getByText, queryByText } = render(<AddGroupMembers />);

    // Verify that the loading state is displayed initially
    expect(queryByText('John Doe')).toBeNull();

    // Wait for the "Friends on MSN" header to appear, indicating data has loaded
    await waitFor(() => expect(getByText('Friends on MSN')).toBeTruthy());

    // Verify that the friends are displayed in the UI
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Jane Smith')).toBeTruthy();
  });

  it('filters friends based on search input', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<AddGroupMembers />);

    // Wait for the friends list to load
    await waitFor(() => expect(getByText('Friends on MSN')).toBeTruthy());

    // Simulate entering a search query
    const searchInput = getByPlaceholderText('Search');
    act(() => {
      fireEvent.changeText(searchInput, 'Jane');
    });

    // Verify that only the filtered friend is displayed
    expect(getByText('Jane Smith')).toBeTruthy();
    expect(queryByText('John Doe')).toBeNull();
  });

  it('allows selecting and deselecting friends', async () => {
    const { getByText, getAllByTestId } = render(<AddGroupMembers />);

    // Wait for the friends list to load
    await waitFor(() => expect(getByText('Friends on MSN')).toBeTruthy());

    // Find the friend "John Doe" and its corresponding selection icon
    const johnDoe = getByText('John Doe');
    const johnDoeIcon = getAllByTestId('Ionicons')[0]; // Assuming the first icon corresponds to John Doe

    // Simulate selecting "John Doe"
    act(() => {
      fireEvent.press(johnDoe);
    });

    // Verify that the icon color changes to indicate selection
    expect(johnDoeIcon.props.color).toBe('#00796B');

    // Simulate deselecting "John Doe"
    act(() => {
      fireEvent.press(johnDoe);
    });

    // Verify that the icon color changes back to indicate deselection
    expect(johnDoeIcon.props.color).toBe('#ccc');
  });
});
