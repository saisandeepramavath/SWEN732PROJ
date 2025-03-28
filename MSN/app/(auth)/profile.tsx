import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { getAuth } from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
const ProfileScreen = () => {
  const auth = getAuth();
    // Get the currently signed-in user
  const [user, setUser] = React.useState<any>(null);
  React.useEffect(() => {
    const fetchUser = async () => {
      const doc = await firestore().collection('users').doc(auth.currentUser?.uid).get();
      setUser(doc.data());
    };
    fetchUser();
  }, []);
const router = useRouter();
  const menuItems = [
    { icon: <MaterialIcons name="qr-code" size={20} />, label: 'Scan code' },
    { label: 'Notifications' },
    { label: 'Security' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Search */}
      <View style={styles.searchHeader}>
        <Ionicons name="search" size={24} color="gray" />
      </View>

      {/* Header */}
      <Text style={styles.title}>Account</Text>

      <View style={styles.profileContainer}>
        <View style={styles.profileIconWrapper}>
          <View style={styles.profileIcon} />
          <Ionicons name="camera" size={16} color="#333" style={styles.cameraIcon} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user?.fullName || 'Your name'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Settings</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} >
            {item.icon && <View style={styles.iconWrapper}>{item.icon}</View>}
            <Text style={styles.menuText}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Log out */}
    <TouchableOpacity onPress={() => { auth.signOut().then(() => { router.replace("/");router.reload() }); }} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchHeader: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  profileIconWrapper: {
    position: 'relative',
    marginRight: 15,
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#c2185b',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
  },
  userEmail: {
    color: '#666',
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconWrapper: {
    width: 28,
    alignItems: 'center',
    marginRight: 10,
  },
  menuText: {
    fontSize: 15,
    color: '#333',
  },
  logoutButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  logoutText: {
    color: '#00796B',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default ProfileScreen;