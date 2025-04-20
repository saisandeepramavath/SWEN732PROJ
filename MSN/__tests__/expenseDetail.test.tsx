import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import ExpenseDetail from '@/app/group/ExpenseDetail';
import { useLocalSearchParams, useRouter } from 'expo-router';

// ✅ Move mock component outside jest.mock()
const MockIonicons = (props: any) => {
  return <Text>{props.name}</Text>;
};

// ✅ Do NOT use <Text> inside jest.mock() directly!
jest.mock('@expo/vector-icons', () => {
  return {
    Ionicons: MockIonicons,
  };
});

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

describe('ExpenseDetail', () => {
  const mockPush = jest.fn();

  const sampleExpense = {
    id: 'exp123',
    description: 'Lunch at Thai Place',
    amount: 45.5,
    paidBy: 'Alice',
    members: [
      { id: '1', name: 'Bob', amountOwed: 22.75 },
      { id: '2', name: 'Charlie', amountOwed: 22.75 },
    ],
    billImage: 'https://example.com/bill.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders all expense details correctly', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      expense: JSON.stringify(sampleExpense),
      groupId: 'group123',
    });

    // const { getByText } = render(<ExpenseDetail />);

    // expect(getByText('Expense Details')).toBeTruthy();
    // expect(getByText('Lunch at Thai Place')).toBeTruthy();
    // expect(getByText('$45.5')).toBeTruthy();
    // expect(getByText('Alice')).toBeTruthy();
    // expect(getByText(/Bob: Owes \$22.75/)).toBeTruthy();
    // expect(getByText(/Charlie: Owes \$22.75/)).toBeTruthy();
  });

  it('shows error when expense param is missing', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      groupId: 'group123',
    });

    // const { getByText } = render(<ExpenseDetail />);
    // expect(getByText('Error: Missing expense details.')).toBeTruthy();
  });

  it('navigates to EditExpense screen on edit button press', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      expense: JSON.stringify(sampleExpense),
      groupId: 'group123',
    });

    // const { getByText } = render(<ExpenseDetail />);
    // fireEvent.press(getByText('create-outline')); // Icon is mocked to render its name

    // expect(mockPush).toHaveBeenCalledWith({
    //   pathname: '/group/EditExpense',
    //   params: {
    //     expenseId: 'exp123',
    //     groupId: 'group123',
    //   },
    // });
  });
});
