import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { View, StyleSheet, Alert } from 'react-native';
import { ActivityIndicator, Text, TextInput, Button, Card } from 'react-native-paper';

const ProfileSettings: React.FC = () => {
    const user = auth().currentUser;
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                try {
                    const userDoc = await firestore().collection('users').doc(user.uid).get();
                    if (userDoc.exists) {
                        setUserData(userDoc.data());
                    } else {
                        setError('User data not found');
                    }
                } catch (err) {
                    setError('Failed to fetch user data');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    const handleUpdate = async () => {
        if (user) {
            try {
                await firestore().collection('users').doc(user.uid).update(userData);
                await user.updateProfile({
                    displayName: userData?.name,
                });
                Alert.alert('Profile updated successfully');
            } catch (err) {
                setError('Failed to update profile');
            }
        }
    };

    const handleChange = (name: string, value: string) => {
        setUserData((prevData: any) => ({
            ...prevData,
            [name]: value,
        }));
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator testID="loading-indicator" size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text testID="error-message" style={styles.errorText}>
                    {error}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Title title="Profile Settings" />
                <Card.Content>
                    <TextInput
                        label="Full Name"
                        value={userData?.fullName || ''}
                        onChangeText={(text) => handleChange('fullName', text)}
                        style={styles.input}
                        mode="outlined"
                    />
                    <TextInput
                        label="Email"
                        value={userData?.email || ''}
                        onChangeText={(text) => handleChange('email', text)}
                        style={styles.input}
                        mode="outlined"
                        disabled // Email is typically not editable
                    />
                    <Button
                        mode="contained"
                        onPress={handleUpdate}
                        style={styles.button}
                    >
                        Update Profile
                    </Button>
                </Card.Content>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    card: {
        padding: 16,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 16,
        backgroundColor: '#00796B',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
});

export default ProfileSettings;
