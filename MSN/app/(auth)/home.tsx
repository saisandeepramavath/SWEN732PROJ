import { View, Text, Button } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {getAuth} from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';

const Page = () => {
	const auth = getAuth(getApp());
	const user = auth.currentUser;
	const router = useRouter();
	return (
		<View>
			<Text>Welcome back back {user?.email}</Text>
			<Button title="Sign out" onPress={() => {auth.signOut();router.replace('/')} } />
				<Button title="Go to groups" onPress={() => router.push('/(auth)/groups')} />
		</View>
	);
};
export default Page;