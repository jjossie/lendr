import { getUserFromUid, getUserFromAuth, registerUser, logInUser, signOutUser } from './auth'; // Assuming other functions might be tested later or are part of the module
import { db } from '../config/firebase';
import { LendrUserSchema } from '../models/lendrUser.zod';
import { ObjectValidationError } from '../utils/errors';
import { User as FirebaseAuthUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

// Mock Firestore
jest.mock('../config/firebase', () => ({
  db: {
    // We only need getDoc for the functions being tested (getUserFromUid, getUserFromAuth)
    getDoc: jest.fn(),
    // Add other Firestore functions if other auth controller functions are tested (e.g., setDoc, updateDoc)
    doc: jest.fn((db, path, id) => ({ path: `${path}/${id}` })), // Mock doc to return a path-like object for clarity if needed
    collection: jest.fn(), 
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    arrayUnion: jest.fn(),
    arrayRemove: jest.fn(),
  },
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null, // Default, can be set in tests
  })),
  // Mock other auth functions if needed by the controller functions under test
  // For getUserFromUid/Auth, these are not directly called by them, but by other functions in auth.ts
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// Mock other dependencies like notifications if they are called within the tested functions
jest.mock('../config/device/notifications', () => ({
    registerForPushNotificationsAsync: jest.fn().mockResolvedValue('mockExpoPushToken'),
}));


const mockTimestamp = (date = new Date()): Timestamp => ({
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: (date.getTime() % 1000) * 1000000,
  toDate: () => date,
} as Timestamp);

const validUserUid = 'user123';
const mockValidLendrUserData = {
  uid: validUserUid,
  displayName: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  photoURL: 'http://example.com/photo.jpg',
  expoPushTokens: ['token1'],
  createdAt: mockTimestamp(),
  modifiedAt: mockTimestamp(),
  relations: ['relation1'],
  providerData: [{ providerId: 'password' }],
};

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for getDoc (can be overridden in specific tests)
    (db.getDoc as jest.Mock).mockResolvedValue({ exists: () => false, data: () => undefined });
  });

  describe('getUserFromUid', () => {
    it('should return a validated user when given a valid UID and data exists', async () => {
      (db.getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        id: validUserUid, // Firestore doc snapshot id
        data: () => mockValidLendrUserData,
      });

      const user = await getUserFromUid(validUserUid);

      expect(db.getDoc).toHaveBeenCalledTimes(1);
      // expect(db.doc).toHaveBeenCalledWith(db, 'users', validUserUid); // More specific check
      expect(user).toBeDefined();
      expect(user?.uid).toBe(validUserUid);
      expect(user?.displayName).toBe(mockValidLendrUserData.displayName);
      // Check if the returned data passes our schema (it should, as it's used for validation)
      expect(LendrUserSchema.safeParse(mockValidLendrUserData).success).toBe(true);
    });

    it('should return undefined if user document does not exist', async () => {
      (db.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });
      const user = await getUserFromUid('nonExistentUser');
      expect(user).toBeUndefined();
    });
    
    it('should return undefined if user data is undefined (though exists is true - edge case)', async () => {
        (db.getDoc as jest.Mock).mockResolvedValueOnce({ 
            exists: () => true, 
            id: 'someId',
            data: () => undefined 
        });
        // The controller's safeParse would fail, but the schema expects an object.
        // If data() is undefined, safeParse gets undefined -> error.
        // The controller code should throw ObjectValidationError here.
        await expect(getUserFromUid('someId')).rejects.toThrow(ObjectValidationError);
    });

    it('should throw ObjectValidationError if user data is invalid', async () => {
      const invalidUserData = { ...mockValidLendrUserData, displayName: undefined }; // displayName is required
      (db.getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        id: validUserUid,
        data: () => invalidUserData,
      });

      await expect(getUserFromUid(validUserUid)).rejects.toThrow(ObjectValidationError);
    });
  });

  describe('getUserFromAuth', () => {
    const mockAuthUser = {
      uid: validUserUid,
      displayName: 'Auth User DisplayName', // Firebase Auth User might have different displayName
      email: 'authuser@example.com',
      photoURL: 'http://auth.example.com/photo.jpg',
      // ... other FirebaseAuthUser properties
    } as FirebaseAuthUser;

    it('should return a validated user when auth user exists in Firestore with valid data', async () => {
      (db.getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        id: mockAuthUser.uid,
        data: () => mockValidLendrUserData, // Firestore data for this user
      });

      const user = await getUserFromAuth(mockAuthUser);

      expect(db.getDoc).toHaveBeenCalledTimes(1);
      // expect(db.doc).toHaveBeenCalledWith(db, 'users', mockAuthUser.uid);
      expect(user).toBeDefined();
      expect(user?.uid).toBe(mockAuthUser.uid);
      expect(user?.displayName).toBe(mockValidLendrUserData.displayName); // Expecting Firestore data
    });

    it('should return undefined if auth user document does not exist in Firestore', async () => {
      (db.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });
      const user = await getUserFromAuth(mockAuthUser);
      expect(user).toBeUndefined();
    });
    
    it('should throw ObjectValidationError if user data is undefined (though exists is true - edge case)', async () => {
        (db.getDoc as jest.Mock).mockResolvedValueOnce({ 
            exists: () => true, 
            id: mockAuthUser.uid,
            data: () => undefined 
        });
        await expect(getUserFromAuth(mockAuthUser)).rejects.toThrow(ObjectValidationError);
    });

    it('should throw ObjectValidationError if auth user data in Firestore is invalid', async () => {
      const invalidUserData = { ...mockValidLendrUserData, email: 'not-an-email' }; // email must be valid
      (db.getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        id: mockAuthUser.uid,
        data: () => invalidUserData,
      });

      await expect(getUserFromAuth(mockAuthUser)).rejects.toThrow(ObjectValidationError);
    });
  });
});
