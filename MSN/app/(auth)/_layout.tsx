import { Stack } from 'expo-router';

const Layout = () => {
	return (
		<Stack>
			<Stack.Screen name="home" options={{ title: 'Home' }} />
			<Stack.Screen name="groups" options={{ title: 'Groups' }} />
		</Stack>
	);
};

export default Layout;