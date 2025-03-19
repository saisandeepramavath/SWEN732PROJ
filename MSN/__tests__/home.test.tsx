// import React from 'react';
// import { render, fireEvent, waitFor } from '@testing-library/react-native';
// import Home from '../app/(auth)/home';
// import { getAuth } from '@react-native-firebase/auth';
// import { getApp } from '@react-native-firebase/app';
// jest.mock('@react-native-firebase/auth');

// describe('Home', () => {
// 	it('should match snapshot', () => {
// 		const { toJSON } = render(<Home />);
// 		expect(toJSON()).toMatchSnapshot();
// 	});

// 	it('should display user email', () => {
// 		const mockUser = { email: 'test@example.com' };
// 		const auth = getAuth(getApp());
// 		auth.currentUser = mockUser;

// 		const { getByText } = render(<Home />);
// 		expect(getByText(`Welcome back back ${mockUser.email}`)).toBeTruthy();
// 	});

// 	it('should call signOut on button press', async () => {
// 		const mockSignOut = jest.fn();
// 		const auth = getAuth(getApp());
// 		auth.signOut = mockSignOut;

// 		const { getByText } = render(<Home />);
// 		fireEvent.press(getByText('Sign out'));

// 		await waitFor(() => {
// 			expect(mockSignOut).toHaveBeenCalled();
// 		});
// 	});

// 	it('should navigate to groups on button press', () => {
// 		const mockPush = jest.fn();
// 		const useRouter = jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({ push: mockPush });

// 		const { getByText } = render(<Home />);
// 		fireEvent.press(getByText('Go to groups'));

// 		expect(mockPush).toHaveBeenCalledWith('/(auth)/groups');
// 	});
// });
// 		auth.currentUser = mockUser;

// 		const { getByText } = render(<Home />);
// 		expect(getByText(`Welcome back back ${mockUser.email}`)).toBeTruthy();
// 	});

// 	it('should call signOut on button press', async () => {
// 		const mockSignOut = jest.fn();
// 		auth().signOut = mockSignOut;

// 		const { getByText } = render(<Home />);
// 		fireEvent.press(getByText('Sign out'));

// 		await waitFor(() => {
// 			expect(mockSignOut).toHaveBeenCalled();
// 		});
// 	});
// });
