import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ExpenseDetail = () => {
  const { expense, groupId } = useLocalSearchParams();
  const router = useRouter();

  if (!expense) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Missing expense details.</Text>
      </View>
    );
  }

  const parsedExpense = JSON.parse(expense);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with Edit Button */}
      <View style={styles.header}>
        <Text style={styles.title}>Expense Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>{
            console.log(parsedExpense.id, 'Edit button pressed');
            router.push({
              pathname: '/group/EditExpense',
              params: { expenseId: parsedExpense.id, groupId },
            })}
          }
        >
          <Ionicons name="create-outline" size={24} color="#00796B" />
        </TouchableOpacity>
      </View>

      {/* Expense Description */}
      <View style={styles.detailCard}>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{parsedExpense.description || 'No Description'}</Text>
      </View>

      {/* Amount */}
      <View style={styles.detailCard}>
        <Text style={styles.label}>Amount:</Text>
        <Text style={styles.value}>${parsedExpense.amount || 0}</Text>
      </View>

      {/* Paid By */}
      <View style={styles.detailCard}>
        <Text style={styles.label}>Paid By:</Text>
        <Text style={styles.value}>{parsedExpense.paidBy || 'Unknown'}</Text>
      </View>

      {/* Members Involved */}
      <View style={styles.detailCard}>
        <Text style={styles.label}>Members:</Text>
        {parsedExpense.members && parsedExpense.members.length > 0 ? (
          parsedExpense.members.map((member: any, idx: number) => (
            <Text key={idx} style={styles.memberText}>
              - {member.name || member.id}: {member.amountOwed > 0 ? `Owes $${member.amountOwed}` : 'Not included'}
            </Text>
          ))
        ) : (
          <Text style={styles.value}>No members involved.</Text>
        )}
      </View>

      {/* Bill Image */}
      {parsedExpense.billImage && (
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Bill Image:</Text>
          <Image source={{ uri: parsedExpense.billImage }} style={styles.billImage} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 5,
  },
  detailCard: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  memberText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  billImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default ExpenseDetail;
