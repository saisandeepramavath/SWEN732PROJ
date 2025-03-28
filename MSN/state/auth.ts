import {atom} from 'recoil'

import { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const authState = atom<{
  isAuth: boolean;
  user: FirebaseAuthTypes.User | null;
}>({
  key: 'authState',
  default: {
    isAuth: false,
    user: null,
  },
});

export const userState = atom({
    key: 'userState',
    default: {
        name: '',
        email: '',
        photo: '',
        uid: '',
        groups: [],
    }
})

export const groupsState = atom({
    key: 'groupsState',
    default: [],
})
export const selectedGroupState = atom({
    key: 'selectedGroupState',
    default: null,
})
export const selectedGroupMembersState = atom({
    key: 'selectedGroupMembersState',
    default: [],
})
export const selectedGroupTransactionsState = atom({
    key: 'selectedGroupTransactionsState',
    default: [],
})