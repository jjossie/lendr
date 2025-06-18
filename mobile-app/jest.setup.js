global.self = global;

const { MockTimestamp } = require('./__mocks__/utils.mock');

jest.mock("firebase/firestore", () => {
  const ActualFirestore = jest.requireActual("firebase/firestore");
  return {
    ...ActualFirestore,
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn((db, path, id) => {
      return {path, id};
    }),
    setDoc: jest.fn(),
    deleteDoc: jest.fn(),
    getFirestore: jest.fn(),
    Timestamp: MockTimestamp,
  };
});