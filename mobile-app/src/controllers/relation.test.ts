import {
  getRelationById,
  getLiveChatConversationsList,
  getLiveMessages,
  getLiveLoans,
  // createRelation, // Not testing creation in this subtask
  // sendChatMessage, // Not testing sending in this subtask
} from './relation';
import { db, auth } from '../config/firebase'; // auth might be needed for some functions if they use auth.currentUser
import { RelationSchema, ChatMessageSchema, LoanSchema } from '../models/relation.zod';
import { ObjectValidationError, NotFoundError } from '../utils/errors';
import { LendrUser } from '../models/lendrUser'; // For type annotations
import { User as FirebaseAuthUser } from 'firebase/auth'; // Firebase Auth User type
import { Timestamp } from 'firebase/firestore'; // For constructing mock data

// Mock Firestore
jest.mock('../config/firebase', () => ({
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    // Add other Firestore functions if needed by controller, e.g., query, orderBy, limit, where
  },
  auth: { // Mock auth if currentUser is accessed directly in controllers
    currentUser: null, // Default to no user, can be set in tests
  },
}));

// Mock other dependencies if necessary, e.g., other controllers
jest.mock('./auth', () => ({
  getUserFromAuth: jest.fn(),
  getUserFromUid: jest.fn(),
}));

// Mock onSnapshot
// Store callbacks to allow manual invocation in tests
let mockOnSnapshotCallbacks: Record<string, (snapshot: any) => void> = {};
const mockOnSnapshot = jest.fn((query, callback) => {
  // For simplicity, using query's string representation or a unique ID if available
  // This mock assumes query objects can be uniquely identified for callback storage if needed
  // For these tests, we might just have one onSnapshot active at a time per test.
  const queryKey = 'defaultKey'; // Or generate a unique key based on query if multiple listeners are tested simultaneously
  mockOnSnapshotCallbacks[queryKey] = callback;
  return jest.fn(() => { delete mockOnSnapshotCallbacks[queryKey]; }); // Unsubscribe function
});
jest.mock('firebase/firestore', () => {
  const originalFirestore = jest.requireActual('firebase/firestore');
  return {
    ...originalFirestore,
    onSnapshot: mockOnSnapshot,
    // Mock other specific firestore exports if they are used directly and not via db.
    // e.g. collection, doc, query, orderBy, limit, where, serverTimestamp etc.
    // For controller tests, usually mocking db.collection, db.doc is enough.
    // If controllers import these directly, they need to be mocked here.
    // For now, assuming controllers use db.collection, db.doc etc.
    // serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 } as Timestamp)), // Example
  };
});


const mockTimestamp = (date = new Date()): Timestamp => ({
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: (date.getTime() % 1000) * 1000000,
  toDate: () => date,
} as Timestamp);


// --- SHARED MOCK DATA ---
const mockUserPreview = (uid: string, displayName: string, firstName: string, lastName: string) => ({
  uid,
  displayName,
  firstName,
  lastName,
  photoURL: `http://example.com/photo_${uid}.jpg`,
});

const validRelationId = 'relation123';
const mockValidRelationData = {
  users: [
    mockUserPreview('user1', 'User One', 'User', 'One'),
    mockUserPreview('user2', 'User Two', 'User', 'Two'),
  ],
  createdAt: mockTimestamp(),
  modifiedAt: mockTimestamp(),
  lastMessage: undefined, // Can be populated for specific tests
};

const mockValidChatMessageData = (id: string, senderUid: string, receiverUid: string, text: string) => ({
  id,
  text,
  senderUid,
  receiverUid,
  createdAt: mockTimestamp(),
});

const mockValidLoanData = (id: string, toolId: string, lenderUid: string, borrowerUid: string) => ({
  id,
  toolId,
  lenderUid,
  borrowerUid,
  status: 'requested',
  inquiryDate: mockTimestamp(),
  modifiedAt: mockTimestamp(),
  // tool: undefined, // tool is z.any().optional() for now
});


describe('Relation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSnapshotCallbacks = {}; // Reset callbacks
    // Default mock for getDoc (can be overridden in specific tests)
    (db.getDoc as jest.Mock).mockResolvedValue({ exists: () => false, data: () => undefined });
    // Default mock for getDocs
    (db.getDocs as jest.Mock).mockResolvedValue({ docs: [] });
    // Default auth state
    // @ts-ignore
    auth.currentUser = { uid: 'currentUserUid' } as FirebaseAuthUser; 
  });

  describe('getRelationById', () => {
    it('should return a validated relation when given a valid ID and data', async () => {
      (db.getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        id: validRelationId,
        data: () => mockValidRelationData,
      });

      const relation = await getRelationById(validRelationId);

      expect(db.getDoc).toHaveBeenCalledTimes(1);
      // expect(db.doc).toHaveBeenCalledWith(db.collection(db, 'relations'), validRelationId); // More specific check if needed
      expect(relation).toBeDefined();
      expect(relation.id).toBe(validRelationId);
      expect(relation.users[0].uid).toBe('user1');
      expect(RelationSchema.safeParse(mockValidRelationData).success).toBe(true); // Sanity check schema
    });

    it('should throw NotFoundError if relation document does not exist', async () => {
      (db.getDoc as jest.Mock).mockResolvedValueOnce({ exists: () => false });
      await expect(getRelationById('nonExistentId')).rejects.toThrow(NotFoundError);
    });
    
    it('should throw NotFoundError if relation data is undefined (though exists is true - edge case)', async () => {
        (db.getDoc as jest.Mock).mockResolvedValueOnce({ 
            exists: () => true, 
            id: 'someId',
            data: () => undefined 
        });
        await expect(getRelationById('someId')).rejects.toThrow(NotFoundError);
    });

    it('should throw ObjectValidationError if relation data is invalid', async () => {
      const invalidRelationData = { ...mockValidRelationData, users: undefined }; // users is required
      (db.getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        id: validRelationId,
        data: () => invalidRelationData,
      });
      await expect(getRelationById(validRelationId)).rejects.toThrow(ObjectValidationError);
    });
  });

  // --- getLiveChatConversationsList Tests ---
  describe('getLiveChatConversationsList', () => {
    const mockAuthUser = { uid: 'currentUserUid' } as FirebaseAuthUser;
    const mockLendrUser = { 
        uid: 'currentUserUid', 
        relations: ['otherUser1', 'otherUser2'],
        // ... other LendrUser fields if needed by the function
    } as LendrUser;
    let setChatsMock: jest.Mock;
    let setIsLoadedMock: jest.Mock;

    beforeEach(() => {
        setChatsMock = jest.fn();
        setIsLoadedMock = jest.fn();
        // Mock the collection and where for relationsQuery
        const mockQuerySnapshot = (docs: any[]) => ({
            forEach: (callback: (doc: any) => void) => docs.forEach(callback),
            docs: docs, // if directly accessed
        });

        // This mock setup assumes getLiveChatConversationsList internally calls db.collection, query, where, etc.
        // These calls need to be mocked if they are not part of the global firestore mock.
        // For now, we rely on the onSnapshot mock.
    });

    it('should set chats with valid relations and last messages', (done) => {
        const relation1Data = { ...mockValidRelationData, users: [mockUserPreview('currentUserUid', 'Current', 'Curr', 'Ent'), mockUserPreview('otherUser1', 'Other1', 'Oth', 'Er1')] };
        const relation2Data = { ...mockValidRelationData, users: [mockUserPreview('currentUserUid', 'Current', 'Curr', 'Ent'), mockUserPreview('otherUser2', 'Other2', 'Oth', 'Er2')] };
        const message1Data = mockValidChatMessageData('msg1', 'otherUser1', 'currentUserUid', 'Hello');
        
        // Simulate onSnapshot triggering for relations
        const unsubscribe = getLiveChatConversationsList(setChatsMock, setIsLoadedMock, mockAuthUser, mockLendrUser);

        // Trigger the onSnapshot for relations
        const mockRelationSnapshot = {
            forEach: (callback: (doc: any) => void) => {
                [
                    { id: 'rel1', data: () => relation1Data, exists: () => true, ref: 'ref/rel1' },
                    { id: 'rel2', data: () => relation2Data, exists: () => true, ref: 'ref/rel2' },
                ].forEach(callback);
            },
        };
        mockOnSnapshotCallbacks['defaultKey'](mockRelationSnapshot);


        // Mock getDocs for last messages (this part is tricky as it's inside an async Promise.all)
        // We need to ensure this mock is ready when Promise.all executes.
        (db.getDocs as jest.Mock)
            .mockResolvedValueOnce({ docs: [{ id: 'msg1', data: () => message1Data, exists: () => true }] }) // For rel1
            .mockResolvedValueOnce({ docs: [] }); // For rel2 (no last message)

        // Allow promises to resolve
        setTimeout(() => {
            expect(setChatsMock).toHaveBeenCalled();
            const chats = setChatsMock.mock.calls[0][0];
            expect(chats.length).toBe(2);
            expect(chats[0].id).toBe('rel1');
            expect(chats[0].lastMessage?.text).toBe('Hello');
            expect(chats[1].id).toBe('rel2');
            expect(chats[1].lastMessage).toBeUndefined();
            expect(setIsLoadedMock).toHaveBeenCalled();
            unsubscribe(); // Clean up listener
            done();
        }, 0);
    });

    it('should skip invalid relation data', (done) => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const relationValidData = { ...mockValidRelationData, users: [mockUserPreview('currentUserUid', 'Current', 'Curr','Ent'), mockUserPreview('otherUser1', 'Other1','O','1')] };
        const relationInvalidData = { ...mockValidRelationData, users: undefined }; // Invalid

        getLiveChatConversationsList(setChatsMock, setIsLoadedMock, mockAuthUser, { ...mockLendrUser, relations: ['otherUser1', 'invalidUserRel'] });
        
        const mockRelationSnapshot = {
            forEach: (callback: (doc: any) => void) => {
                [
                    { id: 'relValid', data: () => relationValidData, exists: () => true, ref: 'ref/relValid' },
                    { id: 'relInvalid', data: () => relationInvalidData, exists: () => true, ref: 'ref/relInvalid' },
                ].forEach(callback);
            },
        };
        mockOnSnapshotCallbacks['defaultKey'](mockRelationSnapshot);

        (db.getDocs as jest.Mock).mockResolvedValueOnce({ docs: [] }); // For valid relation's messages

        setTimeout(() => {
            expect(setChatsMock).toHaveBeenCalled();
            const chats = setChatsMock.mock.calls[0][0];
            expect(chats.length).toBe(1); // Only the valid one
            expect(chats[0].id).toBe('relValid');
            expect(consoleErrorSpy).toHaveBeenCalledWith("Validation failed for relation:", "relInvalid", expect.anything());
            consoleErrorSpy.mockRestore();
            done();
        }, 0);
    });
  });

  // --- getLiveMessages Tests ---
  describe('getLiveMessages', () => {
    const mockRelation = { id: 'rel123', users: [mockUserPreview('u1','','',''), mockUserPreview('u2','','','')] } as Relation; // Simplified for test
    let setMessagesMock: jest.Mock;

    beforeEach(() => {
      setMessagesMock = jest.fn();
    });

    it('should set valid messages and skip invalid ones', (done) => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const validMsgData = mockValidChatMessageData('msg1', 'u1', 'u2', 'Hi');
      const invalidMsgData = { ...validMsgData, text: undefined }; // text is required

      const unsubscribe = getLiveMessages(setMessagesMock, {} as FirebaseAuthUser, {} as LendrUser, mockRelation);

      const mockMessageSnapshot = {
        forEach: (callback: (doc: any) => void) => {
          [
            { id: 'msgValid', data: () => validMsgData, exists: () => true },
            { id: 'msgInvalid', data: () => invalidMsgData, exists: () => true },
          ].forEach(callback);
        },
      };
      mockOnSnapshotCallbacks['defaultKey'](mockMessageSnapshot); // Trigger onSnapshot

      expect(setMessagesMock).toHaveBeenCalled();
      const messages = setMessagesMock.mock.calls[0][0];
      expect(messages.length).toBe(1);
      expect(messages[0].id).toBe('msgValid');
      expect(messages[0].text).toBe('Hi');
      expect(consoleErrorSpy).toHaveBeenCalledWith("Validation failed for chat message:", "msgInvalid", expect.anything());
      
      consoleErrorSpy.mockRestore();
      unsubscribe?.();
      done();
    });
  });

  // --- getLiveLoans Tests ---
  describe('getLiveLoans', () => {
    const mockRelation = { id: 'rel123', users: [mockUserPreview('u1','','',''), mockUserPreview('u2','','','')] } as Relation;
    let setLoansMock: jest.Mock;

    beforeEach(() => {
      setLoansMock = jest.fn();
    });

    it('should set valid loans and skip invalid ones', (done) => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const validLoanData = mockValidLoanData('loan1', 'tool1', 'u1', 'u2');
      const invalidLoanData = { ...validLoanData, toolId: undefined }; // toolId is required

      const unsubscribe = getLiveLoans(setLoansMock, {} as FirebaseAuthUser, mockRelation);

      const mockLoanSnapshot = {
        forEach: (callback: (doc: any) => void) => {
          [
            { id: 'loanValid', data: () => validLoanData, exists: () => true },
            { id: 'loanInvalid', data: () => invalidLoanData, exists: () => true },
          ].forEach(callback);
        },
      };
      mockOnSnapshotCallbacks['defaultKey'](mockLoanSnapshot); // Trigger onSnapshot

      expect(setLoansMock).toHaveBeenCalled();
      const loans = setLoansMock.mock.calls[0][0];
      expect(loans.length).toBe(1);
      expect(loans[0].id).toBe('loanValid');
      expect(loans[0].status).toBe('requested');
      expect(consoleErrorSpy).toHaveBeenCalledWith("Validation failed for loan:", "loanInvalid", expect.anything());
      
      consoleErrorSpy.mockRestore();
      unsubscribe?.();
      done();
    });
  });
});
