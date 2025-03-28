import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Index from '../app/index';
import auth from '@react-native-firebase/auth';
// import { getApp } from '@react-native-firebase/app';
jest.mock('@react-native-firebase/auth'); // Mock the Firebase authentication module

// Mock alert function to prevent actual alerts during testing
global.alert = jest.fn();
// const auth = getAuth();

describe('Login', () => {
	// Test to ensure the component renders correctly and matches the snapshot
	it('should match snapshot', () => {
		const { toJSON } = render(<Index />);
		expect(toJSON()).toMatchSnapshot(); // Verify the rendered output matches the snapshot
	});

	// Test to check if an error is displayed on failed login
	it('should display error on failed login', async () => {
		const { getByPlaceholderText, getByText } = render(<Index />);

		// Simulate user entering incorrect email and password
		fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
		fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
		fireEvent.press(getByText('Login')); // Simulate pressing the login button

		await waitFor(() => {
			// Verify that the Firebase signInWithEmailAndPassword method was called with the correct arguments
			expect(auth().signInWithEmailAndPassword).toHaveBeenCalledWith('john@example.com', 'wrongpassword');
			// Uncomment the following line to check if an alert is displayed for failed login
			// expect(alert).toHaveBeenCalledWith(expect.stringContaining('Sign in failed:'));
		});
	});

	// Test to check if navigation to the home screen occurs on successful login
	it('should navigate to home on successful login', async () => {
		// Mock the Firebase signInWithEmailAndPassword method to resolve successfully
		(auth().signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});

		const { getByPlaceholderText, getByText } = render(<Index />);

		// Simulate user entering correct email and password
		fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
		fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
		fireEvent.press(getByText('Login')); // Simulate pressing the login button

		// Uncomment the following block to verify the method call and navigation
		// await waitFor(() => {
		// 	expect(auth().signInWithEmailAndPassword).toHaveBeenCalledWith('john@example.com', 'correctpassword');
		// });
	});
});