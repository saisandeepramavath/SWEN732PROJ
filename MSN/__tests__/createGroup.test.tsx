import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Groups from '../app/creategroup';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  Entypo: 'Entypo',
  FontAwesome: 'FontAwesome',
  MaterialIcons: 'MaterialIcons',
}));

jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  getApp: jest.fn(() => ({})), // Mock getApp to return an empty object
}));

jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'test-user-id' }, // Mock currentUser with a test UID
  })),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      add: jest.fn(),
    })),
  })),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('Groups', () => {
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = { back: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should match snapshot', () => {
    const { toJSON } = render(<Groups />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should display error when group name or type is missing', async () => {
    const { getByPlaceholderText, getByText, findByTestId } = render(<Groups />);

    fireEvent.changeText(getByPlaceholderText('Group name'), 'Test Group');
    fireEvent.press(getByText('Done'));

    // Verify that the error message is displayed
    expect(await findByTestId('error-message')).toHaveTextContent(
      'Please enter group name and select a type.'
    );
  });

  it('should call Firestore on successful group creation', async () => {
    const mockAdd = jest.fn();
    (firestore().collection as jest.Mock).mockReturnValue({ add: mockAdd });

    const { getByPlaceholderText, getByText, getByTestId } = render(<Groups />);

    // Simulate user input for all fields
    fireEvent.changeText(getByPlaceholderText('Group name'), 'Test Group');
    fireEvent.press(getByTestId('type-button-Trip')); // Select group type
    fireEvent.press(getByText('Done')); // Trigger group creation

  });

  it('should navigate back when Cancel is pressed', () => {
    const { getByText } = render(<Groups />);

    fireEvent.press(getByText('Cancel'));

    expect(mockRouter.back).toHaveBeenCalled();
  });
});
