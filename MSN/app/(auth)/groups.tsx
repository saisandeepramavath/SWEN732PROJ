import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import firestore from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import * as Contacts from 'expo-contacts';
import { addDoc, collection, serverTimestamp } from '@react-native-firebase/firestore';

const Groups: React.FC = () => {
	const [groupName, setGroupName] = useState('');
	const [contacts, setContacts] = useState<{ id: number, name: string; email: string; number: string }[]>([]);
	const [selectedContacts, setSelectedContacts] = useState<{ id: number, name: string; email: string; number: string }[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [creating, setCreating] = useState(false);
	const app = getApp();
	const auth = getAuth(app);

	useEffect(() => {
		const fetchContacts = async () => {
			const { status } = await Contacts.requestPermissionsAsync();
			if (status === 'granted') {
				const { data } = await Contacts.getContactsAsync({
					pageOffset: 0,
					pageSize: 200,
					fields: [Contacts.Fields.Emails, Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
				});
				if (data.length > 0) {
					const contactsData = data
						.filter(contact => contact.emails && contact.emails.length > 0)
						.map(contact => ({
							id: Number(contact.id),
							name: contact.name,
							email: contact.emails && contact.emails[0] ? contact.emails[0].email || '' : '',
							number: contact.phoneNumbers && contact.phoneNumbers[0] ? contact.phoneNumbers[0].number || '' : ''
						}));

					setContacts(contactsData);
					setLoading(false);
				}
			} else {
				alert('Permission to access contacts was denied');
			}
		};

		fetchContacts();
	}, []);

	const toggleContactSelection = (email: string) => {
		if (selectedContacts.includes(email)) {
			setSelectedContacts(selectedContacts.filter(contact => contact.email !== email));
		} else {
			setSelectedContacts([...selectedContacts, contact]);
		}
	};

	const createGroup = async () => {
		if (!groupName || selectedContacts.length === 0) {
			alert('Please enter a group name and add at least one member.');
			return;
		}
		setCreating(true);
		try {
			const groupRef = collection(firestore(getApp()),'groups');
            await addDoc(groupRef, {
                name: groupName,
                members: selectedContacts,
                createdBy: auth.currentUser?.email,
                createdAt: serverTimestamp(),
            }
            )
			alert('Group created successfully!');
			setGroupName('');
			setSelectedContacts([]);
		} catch (error) {
			alert('Failed to create group: ' + (error as any).message);
		} finally {
			setCreating(false);
		}
	};

	const filteredContacts = contacts.filter(contact =>
		contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		contact.email.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Create Group</Text>
			<TextInput
				style={styles.input}
				value={groupName}
				onChangeText={setGroupName}
				placeholder="Group Name"
				placeholderTextColor="#aaa"
			/>
			<TextInput
				style={styles.input}
				value={searchQuery}
				onChangeText={setSearchQuery}
				placeholder="Search Contacts"
				placeholderTextColor="#aaa"
			/>
			{loading ? <ActivityIndicator size="large" color="#0000ff" animating={loading} />
				: <FlatList
					data={filteredContacts}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item }) => (
						<TouchableOpacity onPress={() => toggleContactSelection(item.email)} style={styles.contactItem}>
							<Text>{item.name} ({item.email})</Text>
							<Text>{item.number}</Text>
							<CheckBox
								value={selectedContacts.includes(item.email)}
								onValueChange={() => toggleContactSelection(item.email)}
							/>
						</TouchableOpacity>
					)}
				/>}
			<Button title={creating ? 'Creating...' : 'Create Group'} onPress={createGroup} disabled={loading} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#f5f5f5',
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 20,
		color: '#333',
	},
	input: {
		marginVertical: 10,
		height: 50,
		borderWidth: 1,
		borderRadius: 8,
		padding: 10,
		backgroundColor: '#fff',
		borderColor: '#ddd',
	},
	member: {
		padding: 10,
		backgroundColor: '#e0e0e0',
		borderRadius: 8,
		marginVertical: 5,
	},
	contactItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 10,
		backgroundColor: '#e0e0e0',
		borderRadius: 8,
		marginVertical: 5,
	},
});

export default Groups;
