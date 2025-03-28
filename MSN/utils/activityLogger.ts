import firestore from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';

const app = getApp();
const auth = getAuth(app);

/**
 * Logs an activity to Firestore.
 * @param {string} type - The type of activity (e.g., "group_created", "expense_added").
 * @param {string} description - A description of the activity.
 * @param {string[]} users - An array of user IDs involved in the activity.
 */
export const logActivity = async (type: string, description: string, users: string[]) => {
	try {
		const currentUser = auth.currentUser;
		if (!currentUser) {
			throw new Error('No authenticated user found.');
		}

		// Add the current user to the list of users if not already included
		if (!users.includes(currentUser.uid)) {
			users.push(currentUser.uid);
		}

		// Log the activity in Firestore
		await firestore().collection('activities').add({
			type,
			description,
			users,
			createdBy: currentUser.uid,
			createdAt: firestore.FieldValue.serverTimestamp(),
		});

		console.log('Activity logged successfully:', { type, description, users });
	} catch (error) {
		console.error('Failed to log activity:', error);
	}
};
