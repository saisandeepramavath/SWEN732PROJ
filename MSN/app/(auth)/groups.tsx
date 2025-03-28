import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

const Page = () => {
	const auth = getAuth(getApp());
	const user = auth.currentUser;
	const router = useRouter();

	const [groups, setGroups] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!user) return;

		const unsubscribe = firestore()
			.collection('groups')
			.where('members', 'array-contains', user.uid)
			.onSnapshot(snapshot => {
				const userGroups = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data()
				}));
				setGroups(userGroups);
				setLoading(false);
			}, error => {
				console.error("Error fetching groups:", error);
				setLoading(false);
			});

		return () => unsubscribe();
	}, [user]);

	return (
		<ScrollView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Ionicons name="search" size={24} color="gray" />
				<Link href="/creategroup">
					<Text style={styles.createGroup}>Create group</Text>
				</Link>
			</View>

			{/* Overall summary */}
			<View style={styles.summary}>
				<Text style={styles.owedText}>
					Overall, you are owed <Text style={styles.owedAmount}>${0}</Text>
				</Text>
				<Ionicons name="filter" size={20} color="gray" />
			</View>

			{/* Group Cards */}
			{loading ? (
				<ActivityIndicator size="large" color="#009688" />
			) : (
				groups.map((group) => (
					<TouchableOpacity
						key={group.id}
						style={styles.card}
						onPress={() => router.push(`/group/${group.id}`)}
					>
						<View style={[styles.iconContainer, { backgroundColor: '#009688' }]}>
							<Ionicons name="people" size={20} color="#fff" />
						</View>
						<View style={styles.cardDetails}>
							<Text style={styles.groupName}>{group.name}</Text>
							<Text style={styles.personText}>
								{group.members?.length || 0} members
							</Text>
						</View>
						<Text style={styles.youAreOwed}>
							you are owed{'\n'}
							<Text style={styles.amount}>$0.00</Text>
						</Text>
					</TouchableOpacity>
				))
			)}

			{/* Settled Group (placeholder) */}
			<TouchableOpacity style={styles.settledButton} onPress={() => router.push('/add')}>
				<Text style={styles.settledText}>Show 1 settled-up group</Text>
			</TouchableOpacity>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 15,
		backgroundColor: '#fff',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	createGroup: {
		color: '#00897B',
		fontWeight: '500',
	},
	summary: {
		marginVertical: 15,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	owedText: {
		fontSize: 16,
	},
	owedAmount: {
		color: '#2e7d32',
		fontWeight: '600',
	},
	card: {
		flexDirection: 'row',
		backgroundColor: '#f3f3f3',
		borderRadius: 10,
		padding: 10,
		alignItems: 'center',
		marginBottom: 10,
	},
	iconContainer: {
		padding: 10,
		borderRadius: 10,
		marginRight: 10,
	},
	cardDetails: {
		flex: 1,
	},
	groupName: {
		fontWeight: '600',
		fontSize: 16,
	},
	personText: {
		fontSize: 14,
		color: '#444',
	},
	youAreOwed: {
		textAlign: 'right',
		fontSize: 12,
		color: '#388e3c',
	},
	amount: {
		fontWeight: '600',
		fontSize: 14,
		color: '#2e7d32',
	},
	settledButton: {
		marginTop: 20,
		borderColor: '#aaa',
		borderWidth: 1,
		padding: 10,
		borderRadius: 10,
		alignItems: 'center',
	},
	settledText: {
		color: '#00796B',
		fontWeight: '500',
	},
});

export default Page;
