import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EditExpense from '../app/group/EditExpense'; // Adjust the path if needed
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// ✅ Mock navigation hooks
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

// ✅ Mock Firestore with correct logic
jest.mock('@react-native-firebase/firestore', () => {
  const mockData = {
    expenses: {
      testExpenseId: {
        description: 'Test Expense',
        amount: 100,
        members: [{ id: '1', name: 'Alice', amountOwed: 50 }],
        billImage: 'http://example.com/image.jpg',
      },
    },
    groups: {
      testGroupId: {
        members: [
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' },
        ],
      },
    },
  };

  const collection = jest.fn((name) => ({
    doc: jest.fn((docId) => ({
      get: jest.fn(() =>
        Promise.resolve({
          data: () => mockData[name]?.[docId],
        })
      ),
      update: jest.fn(() => Promise.resolve()),
    })),
  }));

  return () => ({
    collection,
  });
});

// ✅ Mock Image Picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'http://mock-image.com/pic.jpg' }],
    })
  ),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

describe('EditExpense', () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      groupId: 'testGroupId',
      expenseId: 'testExpenseId',
    });

    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  it('renders and fetches initial data', async () => {
    const { getByText, getByDisplayValue } = render(<EditExpense />);

    await waitFor(() => {
      expect(getByText('Edit Expense')).toBeTruthy();
      expect(getByDisplayValue('Test Expense')).toBeTruthy();
      expect(getByDisplayValue('100')).toBeTruthy();
    });
  });

  it('updates description and amount', async () => {
    const { getByPlaceholderText } = render(<EditExpense />);
    const descInput = await waitFor(() => getByPlaceholderText('Enter description'));
    const amtInput = getByPlaceholderText('Enter amount');

    fireEvent.changeText(descInput, 'Updated Desc');
    fireEvent.changeText(amtInput, '200');

    expect(descInput.props.value).toBe('Updated Desc');
    expect(amtInput.props.value).toBe('200');
  });

  it('toggles member inclusion and updates owed amount', async () => {
    const { getByText, getAllByPlaceholderText } = render(<EditExpense />);
    await waitFor(() => getByText('Alice'));
  
    fireEvent.press(getByText('Bob')); // Toggle Bob on (include)
  
    const amountInputs = getAllByPlaceholderText('Amount owed');
    expect(amountInputs.length).toBe(2); // Alice + Bob
  
    fireEvent.changeText(amountInputs[1], '30');
  
    expect(amountInputs[1].props.value).toBe('30');
  });
  

  it('handles image selection', async () => {
    const { getByText } = render(<EditExpense />);
    const selectImageBtn = await waitFor(() => getByText('Select Image'));

    await act(async () => {
      fireEvent.press(selectImageBtn);
    });

    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
  });

  it('saves the expense and navigates back', async () => {
    const { getByText } = render(<EditExpense />);
    const saveBtn = await waitFor(() => getByText('Save'));

    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Expense updated successfully!');
    expect(mockBack).toHaveBeenCalled();
  });
});
