import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { View, Text, TextInput, Button, ActivityIndicator, Alert } from 'react-native';

const ProfileSettings: React.FC = () => {
    const user = auth().currentUser;
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true); // Ensure loading is initialized to true
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
                    setLoading(false); // Ensure loading is set to false after fetching
                }
            } else {
                setLoading(false); // Handle case where user is not authenticated
            }
        };

        fetchUserData();
    }, [user]);

    const handleUpdate = async () => {
        if (user) {
            try {
                await firestore().collection('users').doc(user.uid).update(userData);
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
            <ActivityIndicator
                testID="loading-indicator" // Ensure testID is correctly set
                size="large"
                color="#0000ff"
            />
        );
    }

    if (error) {
        return (
            <View>
                <Text testID="error-message">{error}</Text>
            </View>
        );
    }

    return (
        <View>
            <Text>Profile Settings</Text>
            <View>
                <Text>Name:</Text>
                <TextInput
                    value={userData?.name || ''}
                    onChangeText={(text) => handleChange('name', text)}
                />
            </View>
            <View>
                <Text>Email:</Text>
                <TextInput
                    value={userData?.email || ''}
                    onChangeText={(text) => handleChange('email', text)}
                />
            </View>
            <Button title="Update Profile" onPress={handleUpdate} />
        </View>
    );
};

export default ProfileSettings;
