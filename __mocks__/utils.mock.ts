// __mocks__/utils.mock.ts

export class MockTimestamp {
  seconds: number;
  nanoseconds: number;
  constructor(seconds: number, nanoseconds: number = 0) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  toDate() {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1000000);
  }
}

export const mockTimestamp = (date = new Date()): MockTimestamp => {
  return new MockTimestamp(
    Math.floor(date.getTime() / 1000),
    (date.getTime() % 1000) * 1000000
  );
};

export const MockFirestore = {
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
  }