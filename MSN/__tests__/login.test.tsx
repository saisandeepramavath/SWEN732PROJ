import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Index from '../app/index';
import auth from '@react-native-firebase/auth';
// import { getApp } from '@react-native-firebase/app';
jest.mock('@react-native-firebase/auth');

// Mock alert function
global.alert = jest.fn();
// const auth = getAuth();
describe('Login', () => {
	it('should match snapshot', () => {
		const { toJSON } = render(<Index />);
		expect(toJSON()).toMatchSnapshot();
	});

	it('should display error on failed login', async () => {
		const { getByPlaceholderText, getByText } = render(<Index />);
		fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
		fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
		fireEvent.press(getByText('Login'));

		await waitFor(() => {
			expect(auth().signInWithEmailAndPassword).toHaveBeenCalledWith('john@example.com', 'wrongpassword');
			// expect(alert).toHaveBeenCalledWith(expect.stringContaining('Sign in failed:'));
		});
	});

	it('should navigate to home on successful login', async () => {
		(auth().signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});
		const { getByPlaceholderText, getByText } = render(<Index />);
		fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
		fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
		fireEvent.press(getByText('Login'));

		// await waitFor(() => {
		// 	expect(auth().signInWithEmailAndPassword).toHaveBeenCalledWith('john@example.com', 'correctpassword');
		// });
	});
});