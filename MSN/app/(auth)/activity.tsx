import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const mockActivity = [
  {
    id: '1',
    type: 'update',
    text: 'You updated "Sffccggh".',
    amount: '$48.33',
    time: '13 minutes ago',
  },
  {
    id: '2',
    type: 'update',
    text: 'You updated "Sffccggh".',
    amount: '$43.50',
    time: '14 minutes ago',
  },
  {
    id: '3',
    type: 'add',
    text: 'You added "Sffccggh".',
    amount: '$38.66',
    time: '16 minutes ago',
  },
  {
    id: '4',
    type: 'group',
    text: 'You added Sandeep N. to the group "480 A".',
    time: 'Saturday at 11:04 PM',
  },
  {
    id: '5',
    type: 'group',
    text: 'You added Sandeep to the group "480 A".',
    time: 'Saturday at 11:03 PM',
  },
  {
    id: '6',
    type: 'setting',
    text: '"Simplify debts" was turned off in the group "480 A".',
    time: 'Saturday at 10:51 PM',
  },
  {
    id: '7',
    type: 'setting',
    text: 'sai turned "simplify debts" on in the group "480 A".\n▶️ See how it works',
    time: 'Saturday at 10:30 PM',
  },
  {
    id: '8',
    type: 'group',
    text: 'You created the group "480 A".',
    time: 'Saturday at 10:00 PM',
  },
];

const ActivityScreen = () => {
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setActivity(mockActivity);
      setLoading(false);
    }, 1000);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'update':
      case 'add':
        return <MaterialCommunityIcons name="file-document-outline" size={24} color="#555" />;
      case 'group':
      case 'setting':
        return <Ionicons name="people" size={24} color="#00796B" />;
      default:
        return <Ionicons name="alert-circle-outline" size={24} color="#999" />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Search + Heading */}
      {/* <View style={styles.header}>
        <Ionicons name="search" size={24} color="gray" />
      </View> */}
      <Text style={styles.title}>Recent activity</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#00796B" style={{ marginTop: 30 }} />
      ) : (
        activity.map(item => (
          <View key={item.id} style={styles.activityItem}>
            <View style={styles.icon}>{getIcon(item.type)}</View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>{item.text}</Text>
              {item.amount && <Text style={styles.amountText}>You get back <Text style={styles.greenText}>{item.amount}</Text></Text>}
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  icon: {
    width: 40,
    height: 40,
    backgroundColor: '#eee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    color: '#111',
    marginBottom: 2,
  },
  amountText: {
    fontSize: 14,
    color: '#388e3c',
    marginBottom: 2,
  },
  greenText: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  timeText: {
    fontSize: 12,
    color: '#777',
  },
});

export default ActivityScreen;