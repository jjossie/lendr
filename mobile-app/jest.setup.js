global.self = global;

const { MockTimestamp } = require("./__mocks__/utils.mock");

jest.mock("firebase/firestore", () => {
  const ActualFirestore = jest.requireActual("firebase/firestore");
  return {
    ...ActualFirestore,
    Timestamp: MockTimestamp,
    collection: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn((db, path, id) => {
      return { path: `${path}/${id}`, id };
    }),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    getFirestore: jest.fn(), // For some reason moving this breaks tests
    setDoc: jest.fn(),

    // Mocking some other functions until stuff breaks or fixes
    addDoc: jest.fn(),
    endAt: jest.fn(),
    limit: jest.fn(),
    onSnapshot: jest.fn(),
    orderBy: jest.fn(),
    startAt: jest.fn(),
    updateDoc: jest.fn(),
    where: jest.fn(),
    query: jest.fn(),
  };
});
