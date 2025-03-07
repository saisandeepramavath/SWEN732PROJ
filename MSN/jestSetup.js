import '@testing-library/jest-native/extend-expect';

// Mock Firebase modules
jest.mock('@react-native-firebase/app', () => ({
    __esModule: true,
    default: jest.fn(() => ({
      initializeApp: jest.fn(() => Promise.resolve(true)),
    })),
    FirebaseApp: {
      initializeApp: jest.fn(() => Promise.resolve(true)),
      apps: [{ name: "mockApp" }],
    },
  }));
  
  jest.mock('@react-native-firebase/auth', () => {
	const mockAuthInstance = {
		createUserWithEmailAndPassword: jest.fn(() =>
			Promise.resolve({ user: { uid: '123' } })
		),
		signInWithEmailAndPassword: jest.fn(() =>
			Promise.resolve({ user: { uid: '123' } })
		),
		signOut: jest.fn(() => Promise.resolve()),
		onAuthStateChanged: jest.fn(),
	};
	const mockAuth = jest.fn(() => mockAuthInstance);
	return mockAuth;
});



  
jest.mock('@react-native-firebase/firestore', () => {
	const mockFirestore = {
		collection: jest.fn(() => ({
			doc: jest.fn(() => ({
				set: jest.fn(() => Promise.resolve()),
			})),
		})),
	};
	return jest.fn(() => mockFirestore);
});


  

  

// Mock global alert
global.alert = jest.fn();
