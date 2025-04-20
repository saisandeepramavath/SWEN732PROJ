import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons, Entypo, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import firestore, { serverTimestamp } from '@react-native-firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { logActivity } from '../utils/activityLogger';

const Groups: React.FC = () => {
  const [groupName, setGroupName] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // New state for error messages
  const auth = getAuth(getApp());
  const router = useRouter();

  const groupTypes = [
    { name: 'Trip', icon: <Ionicons name="airplane" size={24} color="black" /> },
    { name: 'Home', icon: <Entypo name="home" size={24} color="black" /> },
    // { name: 'Couple', icon: <FontAwesome name="heart" size={24} color="black" /> },
    { name: 'Other', icon: <MaterialIcons name="more-horiz" size={24} color="black" /> },
  ];
  /* istanbul ignore next */
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || !selectedType) {
      setErrorMessage('Please enter group name and select a type.'); // Set error message
      return;
    }
    /* istanbul ignore next */
    try {
      const groupRef = firestore().collection('groups');
      const groupDoc = await groupRef.add({
        name: groupName,
        type: selectedType,
        image,
        createdBy: auth.currentUser?.uid,
        members: [auth.currentUser?.uid],
        createdAt: serverTimestamp(),
      });

      // Log the activity
      await logActivity(
        'group_created',
        `Group "${groupName}" of type "${selectedType}" was created.`,
        [auth.currentUser?.uid || '']
      );

      setErrorMessage(null); // Clear error message on success
      alert('Group created!');
      router.back(); // or navigate wherever you need
    } catch (error: any) {
      setErrorMessage('Error creating group: ' + error.message); // Set error message on failure
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerAction}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create a group</Text>
        <TouchableOpacity onPress={handleCreateGroup}>
          <Text style={styles.headerAction}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {errorMessage && (
        <Text testID="error-message" style={styles.errorText}>
          {errorMessage}
        </Text>
      )}

      {/* Group Image Picker */}
	  <View style={{display:'flex',alignItems:'center', flexDirection:'row',paddingRight:100}}>
	  <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.groupImage} />
        ) : (
          <Ionicons name="camera-outline" size={28} color="gray" />
        )}
      </TouchableOpacity>

      {/* Group Name */}
      <TextInput
        style={styles.groupInput}
        placeholder="Group name"
        placeholderTextColor="#999"
        value={groupName}
        onChangeText={setGroupName}
      />
	  </View>
    

      {/* Group Type Selection */}
      <Text style={styles.typeLabel}>Type</Text>
      <View style={styles.typeContainer}>
        {groupTypes.map((type) => (
          <TouchableOpacity
            key={type.name}
            testID={`type-button-${type.name}`} // Add testID for each type
            style={[
              styles.typeButton,
              selectedType === type.name && styles.typeSelected
            ]}
            onPress={() => setSelectedType(type.name)}
          >
            {type.icon}
            <Text style={styles.typeText}>{type.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerAction: {
    color: '#009688',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  imagePicker: {
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
	display:'flex',
    width: 70,
    height: 70,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  groupImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  groupInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 16,
	
    paddingVertical: 10,
    marginBottom: 30,
	width:'100%',
	marginLeft:10
  },
  typeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  typeSelected: {
    backgroundColor: '#e0f2f1',
    borderColor: '#009688',
  },
  typeText: {
    marginTop: 4,
    fontSize: 13,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
});

export default Groups;
