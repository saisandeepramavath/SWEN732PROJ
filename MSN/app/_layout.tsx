import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RecoilRoot } from 'recoil';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications
export function RootLayout() {
	const [initializing, setInitializing] = useState(true);
	const [user, setUser] = useState<FirebaseAuthTypes.User | null>()
	const router = useRouter();
	const segments = useSegments();

	const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
		console.log('onAuthStateChanged', user);
		setUser(user);
		if (initializing) setInitializing(false);

	};

	useEffect(() => {
		const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
		return subscriber;
	}, []);

	useEffect(() => {
		if (initializing) return;

		const inAuthGroup = segments[0] === '(auth)';

		if (user && !inAuthGroup) {
			router.replace('/(auth)/groups');
		} else if (!user && inAuthGroup) {
			router.replace('/');
		}
	}, [user, initializing,onAuthStateChanged]);

	if (initializing)
		return (
			<View
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					flex: 1
				}}
			>
				<ActivityIndicator size="large" />
			</View>
		);

	return (
		<RecoilRoot>

			<View style={styles.container}>

			
		<Stack>
			<Stack.Screen name="index"  options={{ title: 'Login' }} />
			<Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
			<Stack.Screen name="(auth)" options={{ headerShown: false }} />
			<Stack.Screen name="profilesettings" options={{ title: 'Profile Settings' }} />	
			<Stack.Screen name="(modal)" options={{ presentation: 'modal',headerShown:false }} />
		</Stack>
		</View>
		</RecoilRoot>
	);
}


const styles = StyleSheet.create({
	container: {
	  flex: 1,
	  backgroundColor: 'red',  // Ensure the background color is white for the entire screen
	},
  });
