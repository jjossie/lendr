import {config} from "dotenv";

config();
export default {
  "expo": {
    "name": "Lendr",
    "slug": "lendr",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/lendr-logo-square-v2-2.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/lendr-splash-v2-2.png",
      "resizeMode": "contain",
      "backgroundColor": "#2e5339"
    },
    "jsEngine": "hermes",
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.joeljossie.lendr"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
      "eas": {
        "projectId": "84d39ce3-20d9-4fb5-9735-870749bc53ac"
      }
    },
  }
}
