import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

const AddGroupMembers = () => {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [friends, setFriends] = useState<{
    id: string; name: string; email: any; number: any;
  }[]>([]);
  const auth = getAuth();

  // Fetch friends from Firestore
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('No authenticated user found.');
        }

        const friendsSnapshot = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('friends')
          .get();

        const friendsList = friendsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || '',
          email: doc.data().email || '',
          number: doc.data().number || '',
        })) as { id: string; name: string; email: any; number: any }[];

        setFriends(friendsList); // Removed act wrapper
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add group members</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.done}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TextInput
        placeholder="Search"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* Add New Contact */}
      <TouchableOpacity style={styles.newContact}>
        <Ionicons name="person-add" size={18} color="#00796B" />
        <Text style={styles.newContactText}>Add a new contact to MSN</Text>
      </TouchableOpacity>

      {/* Friends List */}
      <FlatList
        data={friends.filter((friend) =>
          friend?.name?.toLowerCase().includes(search.toLowerCase()) ||
          friend?.email?.toLowerCase().includes(search.toLowerCase()) ||
          friend?.number?.toLowerCase().includes(search.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.friendItem}
            onPress={() => toggleSelect(item.id)}
          >
            <View style={styles.friendInfo}>
              <Ionicons name="person-circle" size={32} color="#ccc" />
              <Text style={styles.friendName}>{item.name}</Text>
            </View>
            <Ionicons
              testID="Ionicons"
              name={selected.includes(item.id) ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={selected.includes(item.id) ? '#00796B' : '#ccc'}
            />
          </TouchableOpacity>
        )}
        ListHeaderComponent={() => (
          <Text style={styles.sectionHeader}>Friends on MSN</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cancel: {
    color: '#00796B',
    fontSize: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  done: {
    color: '#00796B',
    fontSize: 16,
  },
  search: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  newContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  newContactText: {
    color: '#00796B',
    marginLeft: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
    color: '#444',
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendName: {
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
});

export default AddGroupMembers;
