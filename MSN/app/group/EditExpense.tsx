import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, FlatList, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

const EditExpense = () => {
  const { groupId, expenseId } = useLocalSearchParams();
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [members, setMembers] = useState<any[]>([]);
  const [billImage, setBillImage] = useState('');

  useEffect(() => {
    console.log('Group ID:', groupId);
    console.log('Expense ID:', expenseId);
    const fetchExpenseAndGroupMembers = async () => {
      try {
        // Fetch expense details
        const expenseDoc = await firestore().collection('expenses').doc(expenseId as string).get();
        const expenseData = expenseDoc.data();

        if (!expenseData) {
          Alert.alert('Error', 'Expense not found.');
          router.back();
          return;
        }

        setDescription(expenseData.description || '');
        setAmount(expenseData.amount || 0);
        setBillImage(expenseData.billImage || '');

        // Fetch group members
        const groupDoc = await firestore().collection('groups').doc(groupId as string).get();
        const groupMembers = groupDoc.data()?.members || [];

        // Merge group members with expense members
        const updatedMembers = groupMembers.map((groupMember: any) => {
          const expenseMember = expenseData.members.find((m: any) => m.id === groupMember.id);
          return expenseMember
            ? { ...expenseMember, included: true }
            : { ...groupMember, included: false, amountOwed: 0 };
        });

        setMembers(updatedMembers);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to fetch data. Please try again.');
      }
    };

    fetchExpenseAndGroupMembers();
  }, [groupId, expenseId]);

  const handleSave = async () => {
    try {
      await firestore()
        .collection('expenses')
        .doc(expenseId as string)
        .update({
          description,
          amount: Number(amount),
          members,
          billImage,
        });
      Alert.alert('Success', 'Expense updated successfully!');
      router.back();
    } catch (error) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', 'Failed to update expense. Please try again.');
    }
  };

  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setBillImage(result.assets[0].uri);
    }
  };

  const handleToggleMember = (memberId: string) => {
    setMembers((prevMembers) =>
      prevMembers.map((member: any) =>
        member.id === memberId ? { ...member, included: !member.included } : member
      )
    );
  };

  const handleUpdateAmountOwed = (memberId: string, amountOwed: string) => {
    setMembers((prevMembers) =>
      prevMembers.map((member: any) =>
        member.id === memberId ? { ...member, amountOwed: Number(amountOwed) } : member
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Expense</Text>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
      />

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        value={amount.toString()}
        onChangeText={(text) => setAmount(Number(text))}
        placeholder="Enter amount"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Members</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <TouchableOpacity onPress={() => handleToggleMember(item.id)}>
              <Text style={[styles.memberName, !item.included && styles.memberExcluded]}>
                {item.name || item.id}
              </Text>
            </TouchableOpacity>
            {item.included && (
              <TextInput
                style={styles.amountInput}
                value={item.amountOwed.toString()}
                onChangeText={(text) => handleUpdateAmountOwed(item.id, text)}
                placeholder="Amount owed"
                keyboardType="numeric"
              />
            )}
          </View>
        )}
      />

      <Text style={styles.label}>Bill Image</Text>
      {billImage ? (
        <Image source={{ uri: billImage }} style={styles.billImage} />
      ) : (
        <Text style={styles.noImageText}>No image selected</Text>
      )}
      <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
        <Text style={styles.imageButtonText}>Select Image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  memberName: {
    fontSize: 14,
    color: '#333',
  },
  memberExcluded: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 5,
    width: 80,
    textAlign: 'center',
  },
  billImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  noImageText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: '#00796B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#00796B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditExpense;
