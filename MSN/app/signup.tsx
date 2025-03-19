import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { act } from 'react-test-renderer';
import { useRouter } from 'expo-router';
const Signup: React.FC = () => {
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	

	const handleSubmit = async () => {
		console.log('🔄 handleSubmit called'); // Debug log
	
		if (password !== confirmPassword) {
			console.log('❌ Passwords do not match');
			 setError('Passwords do not match'); // ✅ Wrap in act()
			return;
		}
	
		setLoading(true); // ✅ Wrap in act()
		try {
			console.log('🚀 Calling Firebase Auth...');
			const userCredential = await auth().createUserWithEmailAndPassword(email, password);
			console.log('✅ Firebase Auth Success:', userCredential);
	
			const user = userCredential.user;
			console.log('📄 Writing user data to Firestore...');
			await firestore().collection('users').doc(user.uid).set({
				fullName,
				email,
				phoneNumber,
			});
			router.push('/')
			console.log('✅ Firestore Write Success');
		} catch (e: any) {
			console.log('❌ Firebase Error:', e);
			setError('Registration failed: ' + e.message); // ✅ Wrap in act()
		} finally {
			setLoading(false); // ✅ Wrap in act()
		}
	};
	
	

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Signup</Text>
			<TextInput
				style={styles.input}
				value={fullName}
				onChangeText={setFullName}
				placeholder="Full Name"
				placeholderTextColor="#aaa"
			/>
			<TextInput
				style={styles.input}
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
				placeholder="Email"
				placeholderTextColor="#aaa"
			/>
			<TextInput
				style={styles.input}
				value={phoneNumber}
				onChangeText={setPhoneNumber}
				keyboardType="phone-pad"
				placeholder="Phone Number"
				placeholderTextColor="#aaa"
			/>
			<TextInput
				style={styles.input}
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				placeholder="Password"
				placeholderTextColor="#aaa"
			/>
			<TextInput
				style={styles.input}
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
				placeholder="Confirm Password"
				placeholderTextColor="#aaa"
			/>

			{/* ✅ Display error messages in UI */}
			{error && <Text testID="error-message" style={styles.errorText}>{error}</Text>}

			<Button title={loading ? 'Signing up...' : 'Signup'} onPress={handleSubmit} disabled={loading} testID="signup-button" />
			{loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
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
	errorText: {
		color: 'red',
		textAlign: 'center',
		marginBottom: 10,
	},
});

export default Signup;
