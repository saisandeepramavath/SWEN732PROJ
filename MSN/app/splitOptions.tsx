import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const SplitOptions = () => {
  const router = useRouter();
  const { groupId, selectedMembers,savedDescription, totalAmount } = useLocalSearchParams();
  const members = JSON.parse(typeof selectedMembers === 'string' ? selectedMembers : '[]');
  const [splitType, setSplitType] = useState<'equal' | 'ratio' | 'custom'>('equal');
  const [splits, setSplits] = useState(
    members.map((member: { id: string; name: string }) => ({
      id: member.id,
      name: member.name,
      value: (parseFloat(totalAmount) / members.length).toFixed(2), // Default to equal split
      ratio: 1, // Default ratio for ratio splitting
    }))
  );

  useEffect(() => {
    if (splitType === 'equal') {
      // Split equally
      setSplits(
        members.map((member: { id: string; name: string }) => ({
          id: member.id,
          name: member.name,
          value: (parseFloat(totalAmount) / members.length).toFixed(2),
          ratio: 1,
        }))
      );
    } else if (splitType === 'ratio') {
      // Split by ratio
      const defaultRatios = members.map((_, index) => (index % 2 === 0 ? 2 : 1)); // Example: 2, 1, 2, 1
      const totalRatio = defaultRatios.reduce((sum, ratio) => sum + ratio, 0);
      setSplits(
        members.map((member: { id: string; name: string }, index) => ({
          id: member.id,
          name: member.name,
          ratio: defaultRatios[index],
          value: ((defaultRatios[index] / totalRatio) * parseFloat(totalAmount)).toFixed(2),
        }))
      );
    } else if (splitType === 'custom') {
      // Reset custom values
      setSplits(members.map((member: { id: string; name: string }) => ({ id: member.id, name: member.name, value: '', ratio: 1 })));
    }
  }, [splitType, totalAmount, members]);

  const handleRatioChange = (id: string, newRatio: string) => {
    const updatedSplits = splits.map((split) =>
      split.id === id ? { ...split, ratio: parseFloat(newRatio) || 0 } : split
    );
    const totalRatio = updatedSplits.reduce((sum, split) => sum + split.ratio, 0);
    setSplits(
      updatedSplits.map((split) => ({
        ...split,
        value: ((split.ratio / totalRatio) * parseFloat(totalAmount)).toFixed(2),
      }))
    );
  };

  const handleCustomSplitChange = (id: string, value: string) => {
    const updatedSplits = splits.map((split) =>
      split.id === id ? { ...split, value: parseFloat(value) || 0 } : split
    );
    const totalCustom = updatedSplits.reduce((sum, split) => sum + parseFloat(split.value || '0'), 0);
    const remainingAmount = parseFloat(totalAmount) - totalCustom;
    const remainingSplits = updatedSplits.filter((split) => split.id !== id);
    if (remainingSplits.length > 0) {
      const autoAdjustValue = (remainingAmount / remainingSplits.length).toFixed(2);
      setSplits(
        updatedSplits.map((split) =>
          split.id !== id ? { ...split, value: autoAdjustValue } : split
        )
      );
    } else {
      setSplits(updatedSplits);
    }
  };

  const handleSaveSplits = () => {
    const totalSplit = splits.reduce((sum, split) => sum + parseFloat(split.value || '0'), 0);
    if (totalSplit !== parseFloat(totalAmount)) {
      Alert.alert('Error', 'The total split amount must equal the total expense amount.');
      return;
    }

    // Pass the updated splits, description, and total amount back to the AddExpense screen
    router.replace({
      pathname: '/add', // Replace with the previous page's route
      params: {
        groupId,
        updatedSplits: JSON.stringify(splits), // Pass the updated splits as a parameter
        savedDescription: savedDescription, // Pass the description
        savedAmount: totalAmount, // Pass the total amount
        members: JSON.stringify(members), // Pass the members
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Split Options</Text>
      <View style={styles.splitTypeContainer}>
        <TouchableOpacity
          style={[styles.splitTypeButton, splitType === 'equal' && styles.splitTypeSelected]}
          onPress={() => setSplitType('equal')}
        >
          <Text style={styles.splitTypeText}>Equal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.splitTypeButton, splitType === 'ratio' && styles.splitTypeSelected]}
          onPress={() => setSplitType('ratio')}
        >
          <Text style={styles.splitTypeText}>Ratio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.splitTypeButton, splitType === 'custom' && styles.splitTypeSelected]}
          onPress={() => setSplitType('custom')}
        >
          <Text style={styles.splitTypeText}>Custom</Text>
        </TouchableOpacity>
      </View>

      {splits.map((split) => (
        <View key={split.id} style={styles.splitRow}>
          <Text style={styles.memberName}>{split.name}</Text>
          {splitType === 'ratio' ? (
            <TextInput
              style={styles.splitInput}
              keyboardType="numeric"
              value={split.ratio.toString()}
              onChangeText={(value) => handleRatioChange(split.id, value)}
            />
          ) : (
            <TextInput
              style={styles.splitInput}
              keyboardType="numeric"
              value={split.value}
              onChangeText={(value) =>
                splitType === 'custom'
                  ? handleCustomSplitChange(split.id, value)
                  : handleRatioChange(split.id, value)
              }
            />
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveSplits}>
        <Text style={styles.saveButtonText}>Save Splits</Text>
      </TouchableOpacity>
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
    fontWeight: '600',
    marginBottom: 20,
  },
  splitTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  splitTypeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  splitTypeSelected: {
    backgroundColor: '#e0f2f1',
    borderColor: '#00796B',
  },
  splitTypeText: {
    fontSize: 14,
    color: '#333',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberName: {
    fontSize: 14,
    color: '#333',
  },
  splitInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 5,
    width: '30%',
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#00796B',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SplitOptions;
