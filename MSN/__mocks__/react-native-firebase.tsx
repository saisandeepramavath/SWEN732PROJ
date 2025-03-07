// __mocks__/react-native-firebase.js
const auth = () => ({
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'mock-uid' } })),
    signOut: jest.fn(() => Promise.resolve()),
    onAuthStateChanged: jest.fn((callback) => {
      callback({ uid: 'initial-uid' }); // Simulate initial user state
      return () => {}; // Mock unsubscribe function
    }),
  });
  
  const firestore = () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ name: 'Mock Data' }) })),
        set: jest.fn(() => Promise.resolve()),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'mock-doc-id' })),
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ docs: [{ id: 'mock-doc-id', data: () => ({}) }] }))
      }))
    })),
  });
  
  const messaging = () => ({
    requestPermission: jest.fn(() => Promise.resolve()),
    getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
    onMessage: jest.fn(() => () => {}),
    onNotificationOpenedApp: jest.fn(() => () => {}),
    setBackgroundMessageHandler: jest.fn(() => () => {})
  });
  
  const storage = () => ({
    ref: jest.fn(() => ({
      putFile: jest.fn(() => Promise.resolve({ downloadURL: 'mock-download-url' })),
      getDownloadURL: jest.fn(() => Promise.resolve('mock-download-url')),
      delete: jest.fn(() => Promise.resolve()),
    })),
  });
  
  module.exports = {
    auth,
    firestore,
    messaging,
    storage,
  };
  
