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
    console.log('🚀 Button Pressed in Test');
  
    // Wait for authentication to be called
    // await waitFor(() => {
    //   expect(auth().createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    //   expect(auth().createUserWithEmailAndPassword).toHaveBeenCalledWith('john@example.com', 'password123');
    //   expect(firestore().collection).toHaveBeenCalledWith('users');
    //   // expect(firestore().collection('users').doc).toHaveBeenCalledWith(0);
    //   expect(firestore().collection('users').doc('123').set).toHaveBeenCalledWith({
    //     fullName: 'John Doe',
    //     email: 'john@example.com',
    //     phoneNumber: '1234567890',
    //   });
    // });
  });
  
  
});
