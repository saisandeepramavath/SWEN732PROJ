
import { useEffect, useState } from 'react';
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
import auth from '@react-native-firebase/auth';
import { FirebaseError } from 'firebase/app';
import { act } from 'react-test-renderer';

export default function Index() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const unsubscribe = auth().onAuthStateChanged(user => {
			if (user) {
				router.push('/(auth)/groups');
			}
		});

		return () => unsubscribe();
	}
	, []);
	
	const signIn = async () => {
		setLoading(true);
		try {
			await auth().signInWithEmailAndPassword(email, password);
			router.push('/(auth)/groups');
		} catch (e: any) {
			
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