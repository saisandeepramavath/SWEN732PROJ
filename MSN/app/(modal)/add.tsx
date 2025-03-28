import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
// Removed unused import
// Removed unused variable

const AddExpense = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState<{ id: string; name: string }[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        if (!user) {
          console.error('User is not authenticated.');
          Alert.alert('Error', 'User is not authenticated.');
          return;
        }
        const userId = user.uid; // Replace with the actual user ID
        const friendsSnapshot = await firestore()
          .collection('users')
          .doc(userId)
          .collection('friends')
          .get();

        const friendsData = friendsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || 'Unknown', // Ensure 'name' is always present
        }));

        setFriends(friendsData);
      } catch (error) {
        console.error('Error fetching friends:', error);
        Alert.alert('Error', 'Failed to fetch friends.');
      }
    };

    fetchFriends();
  }, []);

  const toggleSelect = (item: any) => {
    setUsers([...users, item]);   
    setSelected([...selected, item.id]);   
    setSearch('');
    setUsers([])
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    const filteredFriends = friends.filter((friend) =>
      friend.name.toLowerCase().includes(text.toLowerCase())
    );
    setSearch(text); // Update only the search state
  };

  const handleSave = async () => {
    if (!description || !amount) {
      Alert.alert('Missing Fields', 'Please enter both description and amount.');
      return;
    }

    try {
      await firestore().collection('expenses').add({
        description,
        amount: parseFloat(amount),
        participants: selected,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert('Success', 'Expense added successfully.');
      setDescription('');
      setAmount('');
      setSelected([]);
      setSearch('');
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add an expense</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* With whom */}
        <View style={styles.tagRow}>
          <Text style={styles.withText}>With you and:</Text>
            {selected.map((id) => {
            const friend = friends.find((f) => f.id === id);
            return (
              <TouchableOpacity key={id} style={styles.tag} onPress={() => setSelected(selected.filter((userId) => userId !== id))}>
              <Ionicons name="person" size={16} color="#fff" />
              <Text style={styles.tagText}>{friend?.name || 'Unknown'}</Text>
              </TouchableOpacity>
            );
            })}
          <TextInput
            onChangeText={handleSearch}
            value={search}
            style={[styles.textInput, { flex: 1 }]}
            placeholder="Search contacts"
          />
        </View>

        {search.length > 0 && (
          <>
            <TouchableOpacity style={styles.newContact}>
              <Ionicons name="person-add" size={18} color="#00796B" />
              <Text style={styles.newContactText}>Add a new contact to MSN</Text>
            </TouchableOpacity>

            <FlatList
              data={friends.filter((friend) =>
                friend.name.toLowerCase().includes(search.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.friendItem}
                  onPress={() => toggleSelect(item)}
                >
                  <View style={styles.friendInfo}>
                    <Ionicons name="person-circle" size={32} color="#ccc" />
                    <Text style={styles.friendName}>{item.name}</Text>
                  </View>
                  <Ionicons
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
          </>
        )}

        {!search.length && (
          <View>
            <View style={styles.inputRow}>
              <Ionicons name="document-text-outline" size={24} color="#999" style={styles.iconLeft} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter a description"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.currency}>$</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <Text style={styles.splitText}>
              Paid by{' '}
              <Text
                style={[styles.bold, { color: '#00796B' }]}
                onPress={() => router.push('/selectPayer')}
              >
                you
              </Text>{' '}
              and split{' '}
              <Text
                style={[styles.bold, { color: '#00796B' }]}
                onPress={() => router.push({ pathname: '/splitOptions' })}
              >
                equally
              </Text>
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[search.length ? styles.hide : styles.bottomBar]}>
        <TouchableOpacity>
          <Ionicons name="calendar-outline" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="people-outline" size={24} color="#fb8c00" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="camera-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialIcons name="edit" size={24} color="#4caf50" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  hide: {
    display: 'none',
  },
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveText: {
    color: '#00796B',
    fontWeight: '500',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  withText: {
    fontSize: 14,
    color: '#666',
  },
  tag: {
    flexDirection: 'row',
    backgroundColor: '#fb8c00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginLeft: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  tagText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  iconLeft: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  currency: {
    fontSize: 20,
    marginRight: 6,
    color: '#999',
  },
  splitText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
  },
  bold: {
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
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

export default AddExpense;