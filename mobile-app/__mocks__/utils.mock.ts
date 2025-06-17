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