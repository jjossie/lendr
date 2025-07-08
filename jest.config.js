const ghCopilotRecommended = 'node_modules/(?!(firebase|@firebase|geofire-common|expo-modules-core|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|react-native-svg|@react-native|react-native|@react-native-js-polyfills)/)';

const jestExpoRecommended = "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)";

module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    jestExpoRecommended
  ],
  setupFiles: ['./jest.setup.js'],
  transform: {
    '^.+\.[jt]sx?$': 'babel-jest',
  },
};
