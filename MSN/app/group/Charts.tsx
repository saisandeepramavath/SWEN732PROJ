import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Pie, PolarChart } from 'victory-native';
import { CartesianChart, Bar } from 'victory-native';
import { LinearGradient, vec } from '@shopify/react-native-skia';
import { useLocalSearchParams } from 'expo-router';
import firestore from '@react-native-firebase/firestore';

const screenWidth = Dimensions.get('window').width;

const Charts = () => {
  const { groupId } = useLocalSearchParams();
  const [expenses, setExpenses] = useState<any>(null);
  const [group, setGroup] = useState<any>(null);

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

        setExpenses(groupedExpenses);
      });

    return () => unsubscribe();
  }, [groupId]);

  if (!expenses || !group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Missing data for charts.</Text>
      </View>
    );
  }

  // Prepare data for bar chart
  const barChartData = Object.keys(expenses).map(monthYear => ({
    month: monthYear,
    totalAmount: expenses[monthYear]?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0,
  }));

  // Prepare data for pie chart
  const pieChartData = group.members.map((member: any) => {
    const totalOwed = Object.keys(expenses).reduce((sum: number, monthYear: string) => {
      return (
        sum +
        (expenses[monthYear]?.reduce((memberSum: number, expense: any) => {
          const memberData = expense.members.find((m: any) => m.id === member.id);
          return memberData ? memberSum + Number(memberData.amountOwed) : memberSum;
        }, 0) || 0)
      );
    }, 0);

    return {
      value: totalOwed,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      label: member.name || 'Unknown',
    };
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Monthly Expenses</Text>
      <View style={{ height: 300 }}>
        <CartesianChart
          data={barChartData}
       
          xKey="month"
          yKeys={['totalAmount']}
          domainPadding={{ left: 50, right: 50, top: 30 }}
          axisOptions={{

            formatXLabel: (value) => {
                console.log(value,"VALLL")
                return `${value}`
            }
            
          }}
        >

          {({ points, chartBounds }) => (
            <Bar
              chartBounds={chartBounds}
              points={points.totalAmount}
              roundedCorners={{
                topLeft: 5,
                topRight: 5,
              }}
              
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, 400)}
                colors={['#a78bfa', '#a78bfa50']}
              />
            </Bar>
          )}
        </CartesianChart>
      </View>

      <Text style={styles.title}>Member Contributions</Text>
      <View style={{ height: 300 }}>
        <PolarChart
          data={pieChartData}
          labelKey="label"
          valueKey="value"
          colorKey="color"
        >
          <Pie.Chart innerRadius="50%" />
        </PolarChart>
      </View>
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
    marginBottom: 10,
    textAlign: 'center',
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

export default Charts;
