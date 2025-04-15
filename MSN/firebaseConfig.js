import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
import {getAuth} from 'firebase/auth';
// import {...} from 'firebase/database';
// import {...} from 'firebase/firestore';
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyCXmHGlr_iudIcv19vMEQh7BY13PbNx_sA',
    authDomain: 'msnexp-8f146.firebaseapp.com',
    databaseURL: 'https://msnexp-8f146.firebaseio.com',
    projectId: 'msnexp-8f146',
    storageBucket: 'msnexp-8f146.firebasestorage.app',
    messagingSenderId: '44051972402',
    appId: '1:44051972402:android:fe3e8cef0f0686e718572b',
    measurementId: 'G-measurement-id', // Replace with the actual measurement ID if available
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
