import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Index from '../app/index';
import auth from '@react-native-firebase/auth';

jest.mock('@react-native-firebase/auth');

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

	});

	it('should navigate to home on successful login', async () => {
		(auth().signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});
		const { getByPlaceholderText, getByText } = render(<Index />);
		fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
		fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
		fireEvent.press(getByText('Login'));
	});
});
