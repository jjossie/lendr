global.self = global;

const { MockFirestore } = require("./__mocks__/utils.mock");

jest.mock("firebase/firestore", () => {
  const ActualFirestore = jest.requireActual("firebase/firestore");
  return {
    ...ActualFirestore,
    ...MockFirestore
  };
});
