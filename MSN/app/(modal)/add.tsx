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
  Alert,
  Modal
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
// Removed unused import
// Removed unused variable

const AddExpense = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splits, setSplits] = useState<{ id: string; name: string; value: string }[]>([]); // State to store updated splits
  const router = useRouter();
  const { groupId, updatedSplits, savedDescription, savedAmount, members } = useLocalSearchParams(); // Retrieve updated splits, description, and amount from params
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState<{ id: string; name: string }[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [users,setUsers] = useState<{ id: string; name: string }[]>([]); // State to store selected users
  const auth = getAuth();
  const user = auth.currentUser;
  const [splitModalVisible, setSplitModalVisible] = useState(false); // State to control the split popup
  const [splitType, setSplitType] = useState<'equal' | 'ratio' | 'custom'>('equal'); // State for split type
  const [customSplits, setCustomSplits] = useState<{ id: string; amount: string }[]>([]); // State for custom splits

  useEffect(() => {
    if (updatedSplits) {
      setSplits(JSON.parse(typeof updatedSplits === 'string' ? updatedSplits : '[]')); // Update splits if passed from SplitOptions
    }
    if (savedDescription !== undefined) {
      setDescription(typeof savedDescription === 'string' ? savedDescription : ''); // Restore description
    }
    if (savedAmount !== undefined) {
      setAmount(typeof savedAmount === 'string' ? savedAmount : ''); // Ensure savedAmount is a string
    }
    if(members) {
      setUsers(typeof members === 'string' ? JSON.parse(members) : []); // Restore members
      setSelected(typeof members === 'string' ? JSON.parse(members) : []); // Ensure selected is an array
      console.log(members)
    }
  }, [updatedSplits, savedDescription, savedAmount]);

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

        // Initialize splits with friends if not already set
        if (splits.length === 0) {
          setSplits(
            friendsData.map((friend) => ({
              id: friend.id,
              name: friend.name,
              value: '',
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
        Alert.alert('Error', 'Failed to fetch friends.');
      }
    };

    fetchFriends();
  }, [user]);

  const toggleSelect = (item: any) => {
    setUsers([...users, item]);   
    setSelected([...selected, item]);   
    setSearch('');
    // setUsers([])
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    const filteredFriends = friends.filter((friend) =>
      friend.name.toLowerCase().includes(text.toLowerCase())
    );
    setSearch(text); // Update only the search state
  };

  const handleSave = async () => {
    if (!description || !amount || selected.length === 0) {
      Alert.alert('Missing Fields', 'Please enter description, amount, and select at least one participant.');
      return;
    }
  
    try {
      // Calculate the amount owed by each participant
      const totalParticipants = selected.length + 1; // Include the current user
      const splitAmount = parseFloat(amount) / totalParticipants;
      const members = selected.map((mem) => ({
        id: mem.id,
        name: friends.find((friend) => friend.id === mem.id)?.name || 'Unknown', // Ensure 'name' is always present
        amountOwed: splitAmount.toFixed(2), // Ensure consistent decimal places
        paid: false, // Default to not paid
      }));
      selected.map(id=>console.log(id,"ESLES"))
      // Add the current user as a participant
      const currentUserDoc = await firestore().collection('users').doc(user?.uid).get();
      const currentUserName = currentUserDoc.exists ? currentUserDoc.data()?.fullName || 'You' : 'You';

      members.push({
        id: user?.uid || 'unknown',
        name: currentUserName, // Use the name fetched from Firestore or fallback to 'You'
        amountOwed: splitAmount.toFixed(2),
        paid: true, // Mark the current user as paid
      });
      console.log(members)
      // Save the expense to the root "expenses" collection
      await firestore().collection('expenses').add({
        description,
        amount: parseFloat(amount),
        splitType: splitType,
        groupId, // Include the group ID
        members, // List of members with amounts owed and paid status
        whoOwed: user?.uid || 'unknown', // The user who paid
        createdAt: firestore.Timestamp.fromDate(new Date()), // Set to the current date and time
      });
  
      Alert.alert('Success', 'Expense added successfully.');
      setDescription('');
      setAmount('');
      setSelected([]);
      setSearch('');
      // router.push('/group/{', { groupId }); // Navigate back to the group page
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense.');
    }
  };

  const handleSplitOption = (type: 'equal' | 'ratio' | 'custom') => {
    setSplitType(type);
    setSplitModalVisible(false); // Close the modal after selecting an option
  };

  const handleCustomSplitChange = (id: string, amount: string) => {
    setCustomSplits((prev) =>
      prev.map((split) => (split.id === id ? { ...split, amount } : split))
    );
  };

  const handleSplitNavigation = () => {
    router.replace({
      pathname: '/splitOptions',
      params: {
        groupId,
        selectedMembers: JSON.stringify(splits.map((split) => ({ id: split.id, name: split.name }))), // Pass selected members
        totalAmount: amount, // Pass the total amount
        savedDescription: description, // Pass the description
        savedAmount: amount, // Pass the amount
      },
    });
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

            {users.map((u) => (
            <TouchableOpacity
              key={u.id}
              style={styles.tag}
              onPress={() =>
              {setSelected((prevUser) =>
                prevUser.filter((item) => item.id !== u.id)
              )
              setUsers((prevUser) =>
                prevUser.filter((item) => item.id !== u.id)
              )}
              }
            >
              <View style={{padding:"20px", display:"flex", flexDirection:"row", alignItems:"center"}}>
              <Ionicons name="person" size={16} color="#fff" />
              <Text style={styles.tagText}>{u.name}</Text>
              </View>
            </TouchableOpacity>
            ))}
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
                onPress={handleSplitNavigation} // Navigate to the split options page
              >
                equally
              </Text>
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Split Modal */}
      <Modal
        visible={splitModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSplitModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Split Options</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSplitOption('equal')}
            >
              <Text style={styles.modalOptionText}>Split Equally</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSplitOption('ratio')}
            >
              <Text style={styles.modalOptionText}>Split by Ratio</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleSplitOption('custom')}
            >
              <Text style={styles.modalOptionText}>Custom Amounts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSplitModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    // paddingHorizontal: 10,
    
    paddingVertical: 4,
    borderRadius: 15,
    // marginLeft: 10,
    alignItems: 'center',
    // marginRight: 10,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#00796B',
  },
  modalClose: {
    marginTop: 20,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#ff5252',
  },
});

export default AddExpense;