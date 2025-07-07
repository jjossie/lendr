global.self = global;

const { MockFirestore, MockAuth } = require("./__mocks__/utils.mock");

jest.mock("@react-native-firebase/firestore", () => {
  return {
    ...MockFirestore
  };
});


jest.mock("@react-native-firebase/auth", () => () => MockAuth);