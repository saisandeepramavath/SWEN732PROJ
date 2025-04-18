import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SelectPayer = () => {
  const router = useRouter();
  const { members } = useLocalSearchParams();
  const parsedMembers = typeof members === 'string' ? JSON.parse(members) : [];

  const [memberList] = useState(parsedMembers);

  const handleSelect = (payer: any) => {
    console.log('Selected payer:', payer);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select who paid</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.memberItem} onPress={() => handleSelect(item)}>
            <Ionicons name="person-circle" size={30} color="#00796B" style={{ marginRight: 10 }} />
            <Text style={styles.memberText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberText: {
    fontSize: 16,
    color: '#333',
  },
});

export default SelectPayer;