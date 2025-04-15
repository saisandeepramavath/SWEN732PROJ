import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import { useEffect } from 'react';
import { useNavigationState } from '@react-navigation/native';
import React from 'react';

const Layout = () => {
	const router = useRouter();
	const auth = getAuth(getApp());
	const currentRoute = useNavigationState(state => state.routes[state.index].name);
	const path = usePathname();
	useEffect(() => {
		if (!auth.currentUser) {
			router.push('/');
		}
		console.log(path)
	}, [auth.currentUser]);

	return (
		<View style={{ flex: 1 }}>
			<Tabs
				screenOptions={{
					tabBarShowLabel: false,
					tabBarStyle: {
						height: 60,
						paddingBottom: 5,
						paddingTop: 5,
					},
				}}
			>
				<Tabs.Screen
					name="friends"
					options={{
						title: 'Friends',
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="person-outline" color={color} size={24} />
						),
						headerShown: false,
					}}
				/>
				<Tabs.Screen
					name="groups"
					options={{
						title: 'Groups',
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="people-outline" color={color} size={24} />
						),
						headerShown: false,
					}}
				/>
				<Tabs.Screen
					name="add"
					options={{
						headerShown: false,
						title: 'Add',
						tabBarIcon: ({ color }) => (
							<View
								style={{
									backgroundColor: '#00796B',
									width: 48,
									height: 48,
									borderRadius: 24,
									alignItems: 'center',
									justifyContent: 'center',
									marginBottom: 25,
								}}
							>
								<Ionicons name="add" size={28} color="white" />
							</View>
						),
						tabBarButton: (props) => (
							<TouchableOpacity
								{...props}
								onPress={() => router.push('/add')}
								style={{
									alignItems: 'center',
									justifyContent: 'center',
								}}
								delayLongPress={undefined}
							/>
						),
					}}
				/>
				<Tabs.Screen
					name="activity"
					options={{
						title: 'Activity',
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="trending-up-outline" color={color} size={24} />
						),
					}}
				/>
				<Tabs.Screen
					name="profile"
					options={{
						headerShown: false,
						title: 'Account',
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="person-circle-outline" color={color} size={24} />
						),
					}}
				/>
			</Tabs>
			{path !== '/profile' && (
				<TouchableOpacity
					style={styles.floatingButton}
					onPress={() => router.push('/add')}
				>
					<Ionicons name="add" size={28} color="white" />
				</TouchableOpacity>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	floatingButton: {
		position: 'absolute',
		bottom: 80,
		right: 20,
		backgroundColor: '#00796B',
		width: 60,
		height: 60,
		borderRadius: 30,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 5,
	},
});

export default Layout;
