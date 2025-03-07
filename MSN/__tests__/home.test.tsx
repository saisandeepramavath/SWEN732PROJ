import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Home from '../app/(auth)/home';
import auth from '@react-native-firebase/auth';

jest.mock('@react-native-firebase/auth');

describe('Home', () => {
	it('should match snapshot', () => {
		const { toJSON } = render(<Home />);
		expect(toJSON()).toMatchSnapshot();
	});

	it('should display user email', () => {
		const mockUser = { email: 'test@example.com' };
		auth().currentUser = mockUser;

		const { getByText } = render(<Home />);
		expect(getByText(`Welcome back back ${mockUser.email}`)).toBeTruthy();
	});

	it('should call signOut on button press', async () => {
		const mockSignOut = jest.fn();
		auth().signOut = mockSignOut;

		const { getByText } = render(<Home />);
		fireEvent.press(getByText('Sign out'));

		await waitFor(() => {
			expect(mockSignOut).toHaveBeenCalled();
		});
	});
});
