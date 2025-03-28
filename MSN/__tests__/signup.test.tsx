import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Signup from '../app/signup';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

describe('Signup', () => {
	// Test to ensure the Signup component matches the snapshot
	it('should match snapshot', () => {
		const { toJSON } = render(<Signup />);
		expect(toJSON()).toMatchSnapshot(); // Verify the rendered output matches the snapshot
	});

	// Test to verify error handling when passwords do not match
	it('should display error when passwords do not match', async () => {
		const { getByPlaceholderText, getByTestId, findByTestId } = render(<Signup />);
		
		// Simulate user input for all fields
		fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
		fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
		fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890');
		fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
		fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password456'); // Mismatched password
		
		// Simulate pressing the signup button
		fireEvent.press(getByTestId('signup-button'));

		// Ensure that the Firebase auth method is not called due to validation failure
		await waitFor(() => {
			expect(auth().createUserWithEmailAndPassword).not.toHaveBeenCalled();
		});

		// Verify that the error message is displayed
		expect(await findByTestId('error-message')).toHaveTextContent('Passwords do not match');
	});

	// Test to verify successful signup calls Firebase auth and Firestore
	it('should call auth and firestore on successful signup', async () => {
		const { getByPlaceholderText, getByTestId } = render(<Signup />);
		
		// Simulate user input for all fields
		fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
		fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
		fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890');
		fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
		fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123'); // Matching password
		
		// Simulate pressing the signup button
		fireEvent.press(getByTestId('signup-button'));

		// Ensure Firebase auth and Firestore methods are called
		await waitFor(() => {
			expect(auth().createUserWithEmailAndPassword).toHaveBeenCalled(); // Verify auth is called
			expect(firestore().collection).toHaveBeenCalled(); // Verify Firestore is called
		});

		// Log to confirm button press in the test
		console.log('🚀 Button Pressed in Test');
	});
});
