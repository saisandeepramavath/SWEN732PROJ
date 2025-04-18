import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { useCategoryIcon } from '@/hooks/useCategory';

const GroupDetails = () => {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();
  const user = auth().currentUser?.uid;
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any>({});
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

        // Fetch expenses from the root collection filtered by groupId
        const expensesSnap = await firestore()
          .collection('expenses')
          .where('groupId', '==', groupId)
          .get();

        const expensesList = expensesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Group expenses by month and year
        const groupedExpenses = expensesList.reduce((acc, expense) => {
          const date = new Date(expense.createdAt.seconds * 1000);
          const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: YYYY-MM
          if (!acc[monthYear]) acc[monthYear] = [];
          acc[monthYear].push(expense);
          return acc;
        }, {});

        // Sort expenses within each month by timestamp
        Object.keys(groupedExpenses).forEach(monthYear => {
          groupedExpenses[monthYear].sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
        });

        setExpenses(groupedExpenses);
        setLoading(false);
      }); 
      // Fetch group members
      (async () => {
        const groupDoc = await firestore()
          .collection('groups')
          .doc(groupId as string)
          .get();

        const memberIds = groupDoc.data()?.members || [];

        const membersSnap = await firestore()
          .collection('users')
          .where(firestore.FieldPath.documentId(), 'in', memberIds)
          .get();
        const membersList = membersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log(JSON.stringify(membersList),"MEMEMEMME");
        setGroup(prevGroup => ({ ...prevGroup, members: membersList }));
      })();

    return () => unsubscribe();
  }, [groupId]);

  const handleAddMembers = () => {
    router.push({ pathname: '/addMember', params: { groupId } });
  };

  const handleAddExpense = () => {
    const filteredMembers = group.members.filter((member: any) => member.id !== user); // Replace 'currentUserId' with the actual current user's ID
    router.push({ pathname: '/add', params: { groupId, members: JSON.stringify(filteredMembers)} });
  };

  if (loading || !group) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#009688" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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
      {/* Balances Section */}
        <View style={styles.membersSection}>
          <Text style={styles.membersTitle}>Balances</Text>
          {Object.keys(expenses).length > 0 ? (
            (() => {
              const balances = new Map();

              Object.keys(expenses).forEach(monthYear => {
                expenses[monthYear].forEach((expense: any) => {
                  const payerId = expense.whoOwed;

                  expense.members.forEach(member => {
                    const memberId = typeof member.id === 'object' ? member.id.id : member.id;
                    const amountOwed = Number(member.amountOwed);

                    if (!member.paid) {
                      if (memberId === user) {
                        // Current user owes money to the payer
                        balances.set(
                          payerId,
                          (balances.get(payerId) || 0) + amountOwed
                        );
                      } else if (payerId === user) {
                        // Other members owe money to the current user
                        balances.set(
                          memberId,
                          (balances.get(memberId) || 0) - amountOwed
                        );
                      }
                    }
                  });
                });
              });

              // Render balances
              return Array.from(balances.entries()).map(([memberId, balance], idx) => {
                const memberName = group.members.find((member: any) => member.id === memberId)?.name || 'Unknown';
                return (
                  <Text key={idx} style={styles.memberEmail}>
                    - {memberName}: {balance > 0 ? `Gets $${balance.toFixed(2)}` : `Owes $${Math.abs(balance).toFixed(2)}`}
                  </Text>
                );
              });
            })()
          ) : (
            <Text style={styles.subText}>No balances to display!</Text>
          )}
        </View>
        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push({ pathname: '/group/SettleUp', params: { groupId } })}
          >
            <Text style={styles.buttonText}>Settle up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
                console.log(JSON.stringify(expenses),"EXPENSES");
                console.log(JSON.stringify(group),"GROUP");
                router.push({ pathname: '/group/Charts', params: { groupId } })}}
              >
              <FontAwesome5 name="chart-pie" size={14} color="#333" />
            <Text style={styles.buttonText}> Charts</Text>
          </TouchableOpacity>
          <TouchableOpacity
  style={styles.actionButton}
  onPress={async () => {
    try {
      const expensesData: any[] = [];

      Object.keys(expenses).forEach(monthYear => {
        expenses[monthYear].forEach(expense => {
          const payerName = group.members.find((member: any) => member.id === expense.whoOwed)?.name || 'Unknown';

          const row: any = {
            Month: monthYear,
            Description: expense.description || 'No Description',
            Amount: expense.amount || 0,
            PaidBy: payerName,
          };

          expense.members.forEach((member: any) => {
            const memberName = group.members.find((m: any) => m.id === member.id)?.name || 'Unknown';
            row[`OwedBy_${memberName}`] = member.amountOwed || 0;
          });

          expensesData.push(row);
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(expensesData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');

      const base64Excel = XLSX.write(workbook, {
        type: 'base64',
        bookType: 'xlsx',
      });

      const fileUri = FileSystem.documentDirectory + `Group_${group.name}_Expenses.xlsx`;

      await FileSystem.writeAsStringAsync(fileUri, base64Excel, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!(await Sharing.isAvailableAsync())) {
        alert('Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export. Please try again.');
    }
  }}
>
  <Text style={styles.buttonText}> Export</Text>
</TouchableOpacity>

        </View>

        {/* Expenses List */}
        <View style={styles.membersSection}>
          <Text style={styles.membersTitle}>Expenses</Text>
          {Object.keys(expenses).length > 0 ? (
            Object.keys(expenses).map((monthYear, index) => (
              <View key={index}>
               <Text> {new Date(`${monthYear}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
                {expenses[monthYear].map((expense, idx) => {
                  const { icon, category } = useCategoryIcon(expense.description || '');
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.memberCard, { justifyContent: 'space-between' }]}
                      onPress={() =>
                        router.push({
                          pathname: '/group/ExpenseDetail',
                          params: { expense: JSON.stringify({ ...expense, paidBy: group.members.find((member: any) => member.id === expense.whoOwed)?.name || 'Unknown',groupId }) },
                        })
                      }
                    >
                      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        {icon}
                        <View style={{ marginLeft: 10 }}>
                          <Text style={styles.memberName}>{expense.description || 'No Description'}</Text>
                          <Text style={styles.memberEmail}>Amount: ${expense.amount || 0}</Text>
                          <Text style={styles.memberEmail}>
                            Paid by: {group.members.find((member: any) => member.id === expense.whoOwed)?.name || 'Unknown'}
                          </Text>
                        </View>
                      </View>
                      <Text>
                        {expense.members
                          .filter((member: any) => member.id === user)
                          .map((member: any) => {
                            return (
                              <Text key={member.id} style={styles.memberEmail}>
                                {member.amountOwed > 0 && member.paid
                                  ? `You lent: $${member.amountOwed}`
                                  : member.paid
                                  ? `You are settled`
                                  : `You owe: $${member.amountOwed}`}
                              </Text>
                            );
                          })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          ) : (
            <Text style={styles.subText}>No expenses recorded yet!</Text>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Expense Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={handleAddExpense}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
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
    width: '31.33%',
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
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#d84315',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default GroupDetails;
