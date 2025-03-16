import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Signup from '../app/signup';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


describe('Signup', () => {
	it('should match snapshot', () => {
		const { toJSON } = render(<Signup />);
		expect(toJSON()).toMatchSnapshot();
	});

	it('should display error when passwords do not match', async () => {
		const { getByPlaceholderText, getByTestId, findByTestId } = render(<Signup />);
		fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
		fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
		fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890');
		fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
		fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password456');
		fireEvent.press(getByTestId('signup-button'));
		

		await waitFor(() => {
			expect(auth().createUserWithEmailAndPassword).not.toHaveBeenCalled();
		});
		

		// ✅ Now looking for testID instead of text
		expect(await findByTestId('error-message')).toHaveTextContent('Passwords do not match');
	});

  it('should call auth and firestore on successful signup', async () => {
    const { getByPlaceholderText, getByTestId } = render(<Signup />);
    
    fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('Phone Number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
  
    // Ensure button press is triggered
    fireEvent.press(getByTestId('signup-button'));

	await waitFor(() => {
	  expect(auth().createUserWithEmailAndPassword).toHaveBeenCalled();
	  expect(firestore().collection).toHaveBeenCalled();
	});

    console.log('🚀 Button Pressed in Test');
  
  });
  
  
});
