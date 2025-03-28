import { useState, useEffect } from 'react';
import {
	Text,
	View,
	StyleSheet,
	KeyboardAvoidingView,
	TextInput,
	Button,
	ActivityIndicator,
	TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router'; 
import { getApp } from '@react-native-firebase/app';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import * as Contacts from 'expo-contacts';
import { FirebaseError } from 'firebase/app';

export default function Index() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const app = getApp();
	const auth = getAuth(app);
	
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				router.replace('/(auth)/groups');
			}
		});

		return () => unsubscribe();
	}, [auth, router]);

	const signIn = async () => {
		setLoading(true);
		try {
			await auth.signInWithEmailAndPassword(email, password);

			router.replace('/(auth)/groups');
		} catch (e: any) {
			const error = e as FirebaseError;
			alert('Sign in failed: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<KeyboardAvoidingView behavior="padding">
				<Text style={styles.title}>Welcome</Text>
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
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					placeholder="Password"
					placeholderTextColor="#aaa"
				/>
				{loading ? (
					<ActivityIndicator size={'small'} style={{ margin: 28 }} />
				) : (
					<>
						<TouchableOpacity style={styles.button} onPress={signIn}>
							<Text style={styles.buttonText}>Login</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.button} onPress={() => router.push('/signup')}>
							<Text style={styles.buttonText}>Create account</Text>
						</TouchableOpacity>
					</>
				)}
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginHorizontal: 20,
		flex: 1,
		justifyContent: 'center',
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
	button: {
		backgroundColor: '#007BFF',
		paddingVertical: 15,
		borderRadius: 8,
		marginVertical: 10,
	},
	buttonText: {
		color: '#fff',
		textAlign: 'center',
		fontSize: 16,
		fontWeight: 'bold',
	},
});
