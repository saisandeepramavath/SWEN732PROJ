import React, { useEffect, useState } from 'react';
import { View,Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const SettleUp = () => {
    const { groupId } = useLocalSearchParams();
    const router = useRouter();
    const [balances, setBalances] = useState<Map<string, number>>(new Map());
    const [group, setGroup] = useState<any>(null);
    const [expenses, setExpenses] = useState<any>(null);
    const currentUser = auth().currentUser;

    useEffect(() => {
        if (!groupId || !currentUser) return;

        const fetchGroupAndExpenses = async () => {
            // Fetch group data
            const groupDoc = await firestore().collection('groups').doc(groupId as string).get();
            const groupData = { id: groupDoc.id, ...groupDoc.data() };

            // Fetch and set member names from the users collection
            const membersWithNames = await Promise.all(
                groupData.members.map(async (member: any) => {
                    const userDoc = await firestore().collection('users').doc(member).get();
                    return { id: member, name: userDoc.data()?.name || 'Unknown' };
                })
            );

            groupData.members = membersWithNames;
            setGroup(groupData);

            // Fetch expenses
            const expensesSnap = await firestore()
                .collection('expenses')
                .where('groupId', '==', groupId)
                .get();

            const expensesList = expensesSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Calculate balances for the current user
            const calculatedBalances = new Map();
            expensesList.forEach(expense => {
                const payerId = expense.whoOwed;

                expense.members.forEach(member => {
                    const memberId = typeof member.id === 'object' ? member.id.id : member.id;
                    const amountOwed = Number(member.amountOwed);

                    if (!member.paid) {
                        if (memberId === currentUser.uid) {
                            // Current user owes money to the payer
                            calculatedBalances.set(
                                payerId,
                                (calculatedBalances.get(payerId) || 0) + amountOwed
                            );
                        } else if (payerId === currentUser.uid) {
                            // Other members owe money to the current user
                            calculatedBalances.set(
                                memberId,
                                (calculatedBalances.get(memberId) || 0) - amountOwed
                            );
                        }
                    }
                });
            });

            setBalances(calculatedBalances);
            setExpenses(expensesList);
        };

        fetchGroupAndExpenses();
    }, [groupId, currentUser]);

    const handlePay = async (memberId: string, amount: number) => {
        Alert.alert(
            'Confirm Payment',
            `Are you sure you want to pay $${Math.abs(amount).toFixed(2)} to ${group.members.find((m: any) => m.id === memberId)?.name || 'Unknown'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Pay',
                    onPress: async () => {
                        try {
                            // Update all expenses where the current user owes money to the selected member
                            const batch = firestore().batch();

                            expenses.forEach((expense: any) => {
                                if (expense.whoOwed === memberId) {
                                    const expenseRef = firestore().collection('expenses').doc(expense.id);

                                    const updatedMembers = expense.members.map((member: any) => {
                                        if (currentUser && member.id === currentUser.uid) {
                                            return { ...member, paid: true }; // Mark as paid
                                        }
                                        return member;
                                    });

                                    batch.update(expenseRef, { members: updatedMembers });
                                }
                            });

                            await batch.commit();

                            Alert.alert('Payment Successful', `You have paid $${Math.abs(amount).toFixed(2)}.`);
                            router.replace({ pathname: '/group/[groupId]', params: { groupId } }); // Refresh the group page
                        } catch (error) {
                            console.error('Error settling up:', error);
                            Alert.alert('Error', 'Failed to settle up. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    if (!group || !balances.size) {
        return (
            <View style={styles.loader}>
                <Text style={styles.errorText}>Loading balances...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Settle Up Balances</Text>
            {Array.from(balances.entries()).map(([memberId, balance], idx) => {
                const memberName = group.members.find((member: any) => member.id === memberId)?.name || 'Unknown';
                return (
                    <View key={idx} style={styles.balanceCard}>
                        <Text style={styles.balanceText}>
                            {balance > 0
                                ? `You owe ${memberName} $${balance.toFixed(2)}`
                                : `${memberName} owes you $${Math.abs(balance).toFixed(2)}`}
                        </Text>
                        {/* Show Pay button only if the current user owes money */}
                        {balance > 0 && memberId !== currentUser.uid && (
                            <TouchableOpacity
                                style={styles.payButton}
                                onPress={() => handlePay(memberId, balance)}
                            >
                                <Text style={styles.payButtonText}>Pay</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
    balanceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
    },
    balanceText: {
        fontSize: 14,
        color: '#333',
    },
    payButton: {
        backgroundColor: '#4caf50',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    payButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default SettleUp;
