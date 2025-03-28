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

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'testUserId' },
  })),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          get: jest.fn(async () => ({
            docs: [
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

    // Verify loading state
    expect(queryByText('John Doe')).toBeNull();

    // Wait for friends to load
    await waitFor(() => expect(getByText('Friends on MSN')).toBeTruthy());

    // Verify friends are displayed
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Jane Smith')).toBeTruthy();
  });

  it('filters friends based on search input', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<AddGroupMembers />);

    // Wait for friends to load
    await waitFor(() => expect(getByText('Friends on MSN')).toBeTruthy());

    const searchInput = getByPlaceholderText('Search');
    act(() => {
      fireEvent.changeText(searchInput, 'Jane');
    });

    // Verify filtered results
    expect(getByText('Jane Smith')).toBeTruthy();
    expect(queryByText('John Doe')).toBeNull();
  });

  it('allows selecting and deselecting friends', async () => {
    const { getByText, getAllByTestId } = render(<AddGroupMembers />);

    // Wait for friends to load
    await waitFor(() => expect(getByText('Friends on MSN')).toBeTruthy());

    const johnDoe = getByText('John Doe');
    const johnDoeIcon = getAllByTestId('Ionicons')[0]; // Assuming the first icon corresponds to John Doe

    act(() => {
      fireEvent.press(johnDoe);
    });

    // Verify selection
    expect(johnDoeIcon.props.color).toBe('#00796B');

    act(() => {
      fireEvent.press(johnDoe);
    });

    // Verify deselection
    expect(johnDoeIcon.props.color).toBe('#ccc');
  });
});
