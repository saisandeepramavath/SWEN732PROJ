import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

const AddGroupMembers = () => {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [friends, setFriends] = useState<{
    id: string; name: string; email: any; number: any;
  }[]>([]);
  const auth = getAuth();

  // Fetch friends from Firestore
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('No authenticated user found.');
        }

        const unsubscribe = firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('friends')
          .onSnapshot((snapshot) => {
            const friendsList = snapshot.docs.map((doc) => ({
              id: doc.id,
              name: doc.data().name || '',
              email: doc.data().email || '',
              number: doc.data().number || '',
            })) as { id: string; name: string; email: any; number: any }[];
            console.log(friendsList);
            setFriends(friendsList);
          });

        return () => unsubscribe(); // Cleanup subscription on unmount
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add group members</Text>
        <TouchableOpacity
          onPress={async () => {
            /* istanbul ignore next */
            try {
              if (!groupId) {
                throw new Error('Group ID is missing.');
              }

              const groupRef = firestore().collection('groups').doc(Array.isArray(groupId) ? groupId[0] : groupId);

              await groupRef.update({
                members: firestore.FieldValue.arrayUnion(...selected),
              });

              const batch = firestore().batch();

              for (let i = 0; i < selected.length; i++) {
                for (let j = i + 1; j < selected.length; j++) {
                  const memberA = selected[i];
                  const memberB = selected[j];

                  const memberAFriendRef = firestore()
                    .collection('users')
                    .doc(memberA)
                    .collection('friends')
                    .doc(memberB);

                  const memberADoc = await firestore().collection('users').doc(memberA).get();
                  const memberBDoc = await firestore().collection('users').doc(memberB).get();

                  batch.set(memberAFriendRef, {
                    name: memberBDoc.data()?.fullName || '',
                    email: memberBDoc.data()?.email || '',
                    number: memberBDoc.data()?.phoneNumber || '',
                  }, { merge: true });

                  const memberBFriendRef = firestore()
                    .collection('users')
                    .doc(memberB)
                    .collection('friends')
                    .doc(memberA);

                  batch.set(memberBFriendRef, {
                    name: memberADoc.data()?.fullName || '',
                    email: memberADoc.data()?.email || '',
                    number: memberADoc.data()?.phoneNumber || '',
                  }, { merge: true });
                }
              }

              await batch.commit();
              router.back();
            } catch (error) {
              console.error('Error adding members to group:', error);
            }
          }}
        >
          <Text style={styles.done}>Done</Text>
        </TouchableOpacity>

      </View>

      {/* Search Bar */}
      <TextInput
        placeholder="Search"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />
      {!friends.some((friend) =>
        friend?.name?.toLowerCase().includes(search.toLowerCase()) ||
        friend?.email?.toLowerCase().includes(search.toLowerCase()) ||
        friend?.number?.toLowerCase().includes(search.toLowerCase())
      ) && search.trim() !== '' && (<>
       { /* istanbul ignore next */}
        <TouchableOpacity style={styles.newContact} onPress={() => {
          firestore()
            .collection('users')
            .where('email', '==', search)
            .get()
            .then((querySnapshot) => {
              if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const currentUser = auth.currentUser;
                /* istanbul ignore if */
                if (!currentUser) {
                  throw new Error('No authenticated user found.');
                }

                const batch = firestore().batch();

                const currentUserFriendRef = firestore()
                  .collection('users')
                  .doc(currentUser.uid)
                  .collection('friends')
                  .doc(userDoc.id);
                /* istanbul ignore next */
                batch.set(currentUserFriendRef, {
                  name: userDoc.data().fullName || '',
                  email: userDoc.data().email || '',
                  number: userDoc.data().phoneNumber || '',
                });
                /* istanbul ignore next */
                const userFriendRef = firestore()
                  .collection('users')
                  .doc(userDoc.id)
                  .collection('friends')
                  .doc(currentUser.uid);
                /* istanbul ignore next */
                batch.set(userFriendRef, {
                  name: currentUser.displayName || '',
                  email: currentUser.email || '',
                  number: currentUser.phoneNumber || '',
                });
                /* istanbul ignore next */
                batch.commit().then(() => {
                  console.log('User added to friends list.');
                  setSearch('');
                }).catch((error) => {
                  console.error('Error adding user to friends list:', error);
                });

              }/* istanbul ignore next */
              else if (search.trim() !== '') {
                console.log('User not found.');
              }
              /* istanbul ignore next */
              else {
                console.log('No user found with the provided email.');
              }

            }).catch((error) => {
              console.error('Error fetching user:', error);
            });
        }}>

          <Ionicons name="person-add" size={18} color="#00796B" />
          <Text style={styles.newContactText}>Add {search} to contact.</Text>
        </TouchableOpacity>
      </>
        )}
      {/* Add New Contact */}


      {/* Friends List */}
      {/* istanbul ignore next */}
      <FlatList
        data={friends.filter((friend) =>
          friend?.name?.toLowerCase().includes(search.toLowerCase()) ||
          friend?.email?.toLowerCase().includes(search.toLowerCase()) ||
          friend?.number?.toLowerCase().includes(search.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.friendItem}
            onPress={() => toggleSelect(item.id)}
          >
            <View style={styles.friendInfo}>
              <Ionicons name="person-circle" size={32} color="#ccc" />
              <Text style={styles.friendName}>{item.name}</Text>
            </View>
            <Ionicons
              testID="Ionicons"
              name={selected.includes(item.id) ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={selected.includes(item.id) ? '#00796B' : '#ccc'}
            />
          </TouchableOpacity>
        )}
        ListHeaderComponent={() => (
          <Text style={styles.sectionHeader}>Friends on MSN</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cancel: {
    color: '#00796B',
    fontSize: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  done: {
    color: '#00796B',
    fontSize: 16,
  },
  search: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  newContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  newContactText: {
    color: '#00796B',
    marginLeft: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
    color: '#444',
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendName: {
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
});

export default AddGroupMembers;
