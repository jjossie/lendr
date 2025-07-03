global.self = global;

const { MockFirestore } = require("./__mocks__/utils.mock");

jest.mock("@react-native-firebase/firestore", () => {
  const ActualFirestore = jest.requireActual("@react-native-firebase/firestore");
  return {
    ...ActualFirestore,
    ...MockFirestore
  };
});
