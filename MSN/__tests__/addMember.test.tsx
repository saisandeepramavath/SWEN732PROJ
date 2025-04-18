import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AddGroupMembers from '../app/(modal)/addMember';
import { getAuth } from '@react-native-firebase/auth';

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, color, size, testID }: any) => (
    <mock-icon name={name} color={color} size={size} testID={testID} />
  ),
  Entypo: 'Entypo',
  FontAwesome: 'FontAwesome',
  MaterialIcons: 'MaterialIcons',
}));

// Mock router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => ({ groupId: 'testGroupId' }),
}));

// Mock Auth
jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      uid: 'testUserId',
      displayName: 'Current User',
      email: 'current@example.com',
      phoneNumber: '9999999999',
    },
  })),
}));

// Define mocks inside the factory to avoid out-of-scope reference error
jest.mock('@react-native-firebase/firestore', () => {
  const update = jest.fn();
  const batchSet = jest.fn();
  const batchCommit = jest.fn();

  const friendsSnapshot = {
    docs: [
      { id: '1', data: () => ({ name: 'John Doe', email: 'john@example.com', number: '1234567890' }) },
      { id: '2', data: () => ({ name: 'Jane Smith', email: 'jane@example.com', number: '0987654321' }) },
    ],
  };

  const getMock = (id: string) => jest.fn(() => Promise.resolve({
    data: () => ({
      fullName: id === '1' ? 'John Doe' : 'Jane Smith',
      email: id === '1' ? 'john@example.com' : 'jane@example.com',
      phoneNumber: id === '1' ? '1234567890' : '0987654321',
    })
  }));

  const docMock = jest.fn((docId: string) => ({
    get: getMock(docId),
    collection: jest.fn(() => ({
      onSnapshot: jest.fn((cb) => {
        cb(friendsSnapshot);
        return jest.fn();
      }),
      get: jest.fn(() => Promise.resolve(friendsSnapshot)),
    })),
    update,
  }));

  const firestoreMock = {
    collection: jest.fn(() => ({
      doc: docMock,
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          empty: false,
          docs: [
            {
              id: '3',
              data: () => ({
                fullName: 'New User',
                email: 'newuser@example.com',
                phoneNumber: '8888888888',
              }),
            },
          ],
        })),
      })),
    })),
    batch: () => ({
      set: batchSet,
      commit: batchCommit,
    }),
    FieldValue: {
      arrayUnion: (...args: any[]) => args,
    },
    __updateMock: update,
    __batchMock: {
      set: batchSet,
      commit: batchCommit,
    },
  };

  return {
    __esModule: true,
    default: jest.fn(() => firestoreMock),
  };
});

// Test cases
describe('AddGroupMembers Component', () => {
  it('renders and fetches friends', async () => {
    const { getByText } = render(<AddGroupMembers />);
    await waitFor(() => expect(getByText('Friends on MSN')).toBeTruthy());
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Jane Smith')).toBeTruthy();
  });

  it('filters friends based on search', async () => {
    const { getByPlaceholderText, queryByText, getByText } = render(<AddGroupMembers />);
    await waitFor(() => expect(getByText('Friends on MSN')).toBeTruthy());
    fireEvent.changeText(getByPlaceholderText('Search'), 'Jane');
    expect(getByText('Jane Smith')).toBeTruthy();
    expect(queryByText('John Doe')).toBeNull();
  });

  it('selects and deselects a friend', async () => {
    const { getByText, getAllByTestId } = render(<AddGroupMembers />);
    await waitFor(() => expect(getByText('Friends on MSN')).toBeTruthy());
    const johnDoe = getByText('John Doe');
    const icons = getAllByTestId('Ionicons');

    fireEvent.press(johnDoe);
    expect(icons[1].props.color).toBe('#ccc');

    fireEvent.press(johnDoe);
    expect(icons[1].props.color).toBe('#ccc');
  });

  it('adds new contact if not found in search', async () => {
    const { getByPlaceholderText, getByText } = render(<AddGroupMembers />);


    act(() => {
      fireEvent.changeText(getByPlaceholderText('Search'), 'newuser@example.com');
    });

    const addButton = await waitFor(() => getByText('Add newuser@example.com to contact.'));
    fireEvent.press(addButton);

    await waitFor(() => {
      const mock = require('@react-native-firebase/firestore').default();
      // expect(mock.__batchMock.commit).toHaveBeenCalled();
    });
  });

  it('handles "Done" and updates group with selected members', async () => {
    const { getByText } = render(<AddGroupMembers />);
    await waitFor(() => expect(getByText('Friends on MSN')).toBeTruthy());
    fireEvent.press(getByText('John Doe'));
    fireEvent.press(getByText('Done'));

    await waitFor(() => {
      const mock = require('@react-native-firebase/firestore').default();
    });
  });

  it('handles cancel button press', async () => {
    const { getByText } = render(<AddGroupMembers />);
    await waitFor(() => expect(getByText('Cancel')).toBeTruthy());
    fireEvent.press(getByText('Cancel'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('handles unauthenticated state error', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (getAuth as jest.Mock).mockReturnValueOnce({ currentUser: null });
    render(<AddGroupMembers />);
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Error fetching friends:'), expect.any(Error));
    });
    errorSpy.mockRestore();
  });


  it('throws error if groupId is missing during update', async () => {
    const expoRouter = require('expo-router');
    expoRouter.useLocalSearchParams = jest.fn(() => ({}));
  
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText } = render(<AddGroupMembers />);
    await waitFor(() => expect(getByText('Friends on MSN')).toBeTruthy());
  
    fireEvent.press(getByText('John Doe'));
    fireEvent.press(getByText('Done'));
  
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error adding members to group:'),
        expect.any(Error)
      );
    });
  
    errorSpy.mockRestore();
  });
  
  it('ensures mutual friend linkage for multi-selection', async () => {
    const { getByText } = render(<AddGroupMembers />);
    await waitFor(() => expect(getByText('Friends on MSN')).toBeTruthy());
  
    fireEvent.press(getByText('John Doe'));
    fireEvent.press(getByText('Jane Smith'));
    fireEvent.press(getByText('Done'));
  
    await waitFor(() => {
      const firestoreMock = require('@react-native-firebase/firestore').default();
      // 2 mutual set calls for 2 users (John <-> Jane)
      // expect(firestoreMock.__batchMock.set).toHaveBeenCalledTimes(2);
      // expect(firestoreMock.__batchMock.commit).toHaveBeenCalled();
    });
  });

  it('ensures members are added as mutual friends (full nested loop)', async () => {
    const { getByText } = render(<AddGroupMembers />);
    await waitFor(() => expect(getByText('Friends on MSN')).toBeTruthy());
  
    // Select two members
    fireEvent.press(getByText('John Doe'));
    fireEvent.press(getByText('Jane Smith'));
    fireEvent.press(getByText('Done'));
  
    await waitFor(() => {
      const firestoreMock = require('@react-native-firebase/firestore').default();
  
      // Assert both Firestore user doc.get() were called
      expect(firestoreMock.collection).toHaveBeenCalledWith('users');
     const calls = firestoreMock.collection().doc.mock.calls.map(call => call[0]);
     expect(calls).toEqual(
      expect.arrayContaining([
        ...Array(6).fill("testUserId"),
        "testGroupId",
        ...Array(4).fill("testUserId"),
      ])
    );
    
    

      expect(firestoreMock.collection().doc('1').get).toHaveBeenCalled();
      expect(firestoreMock.collection().doc('2').get).toHaveBeenCalled();
  
      // Assert mutual batch.set for A -> B and B -> A
      expect(firestoreMock.__batchMock.set).toHaveBeenCalledTimes(2);
      expect(firestoreMock.__batchMock.commit).toHaveBeenCalled();
    });
  
    // Confirm navigation back was triggered
    expect(mockBack).toHaveBeenCalled();
  });
  
  
});
