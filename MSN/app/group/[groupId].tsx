import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const GroupDetails = () => {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();

  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch group doc
  useEffect(() => {
    if (!groupId) return;

    const unsubscribe = firestore()
      .collection('groups')
      .doc(groupId as string)
      .onSnapshot(async (doc) => {
        const groupData = { id: doc.id, ...doc.data() };
        setGroup(groupData);

        // Fetch subcollection: expenses
        const expensesSnap = await firestore()
          .collection('groups')
          .doc(groupId as string)
          .collection('expenses')
          .get();

        const expensesList = expensesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setExpenses(expensesList);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [groupId]);

  const handleAddMembers = () => {
    router.push({ pathname: '/addMember', params: { groupId } });
  };

  if (loading || !group) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#009688" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Group Info */}
      <View style={styles.groupCard}>
        <Ionicons name="document-text-outline" size={30} color="#fff" style={styles.groupIcon} />
        <Text style={styles.groupName}>{group.name}</Text>
        <TouchableOpacity style={styles.mainButton} onPress={handleAddMembers}>
          <Ionicons name="person-add-outline" size={18} color="#00796B" />
          <Text style={[styles.mainButtonText, { color: '#00796B' }]}> Add members</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.buttonText}>Settle up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome5 name="chart-pie" size={14} color="#333" />
          <Text style={styles.buttonText}> Charts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.buttonText}>Balances</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.buttonText}>Totals</Text>
        </TouchableOpacity>
      </View>

      {/* Expenses List */}
      <View style={styles.membersSection}>
        <Text style={styles.membersTitle}>Expenses</Text>
        {expenses.length > 0 ? (
          expenses.map((expense, index) => (
            <View key={index} style={styles.memberCard}>
              <Ionicons name="cash-outline" size={24} color="#555" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.memberName}>{expense.description || 'No Description'}</Text>
                <Text style={styles.memberEmail}>Amount: ${expense.amount || 0}</Text>
                <Text style={styles.memberEmail}>Paid by: {expense.paidBy || 'Unknown'}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.subText}>No expenses recorded yet!</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  headerBanner: {
    height: 120,
    backgroundColor: '#d84315',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  groupCard: {
    alignItems: 'center',
    marginTop: -35,
    marginBottom: 10,
  },
  groupIcon: {
    backgroundColor: '#d84315',
    padding: 10,
    borderRadius: 15,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
  },
  subText: {
    color: '#777',
    marginTop: 5,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  actionButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  centered: {
    alignItems: 'center',
    marginTop: 20,
  },
  mainButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  mainButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  membersSection: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
  },
  memberName: {
    fontWeight: '500',
    fontSize: 15,
  },
  memberEmail: {
    fontSize: 13,
    color: '#555',
  },
});

export default GroupDetails;
