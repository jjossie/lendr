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
    // "scheme": "lendr",
    "jsEngine": "hermes",
    "updates": {
      "fallbackToCacheTimeout": 0
    },

    "permissions": [
      "CAMERA",
      "CAMERA_ROLL",
    ],

    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.joeljossie.lendr",
      "googleServicesFile": "./.firebase/GoogleService-Info.plist",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/lendr-logo-adaptive-v2-2.png",
        "backgroundColor": "#2e5339"
      },
      "googleServicesFile": "./.firebase/google-services.json",
      "package": "com.joeljossie.lendr"
    },
    "web": {
      "favicon": "./assets/lendr-logo-favicon-v2-2.png"
    },
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-google-signin/google-signin",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Lendr accesses your photo library to let you upload photos of your tools for lending.",
          "cameraPermission": "Lendr accesses your camera to let you take photos of your tools for lending."
        }
      ],
      [
        "expo-location",
        {
           "locationAlwaysAndWhenInUsePermission": "Allow Lendr to use your location. Source: trust me bro"
        }
      ]
    ],

    "extra": {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
      geocoderApiKey: process.env.GEOCODER_API_KEY,
      "eas": {
        "projectId": "84d39ce3-20d9-4fb5-9735-870749bc53ac"
      }
    },
    "doctor": {
      "reactNativeDirectoryCheck": {
        "exclude": [
          "typescript"
        ]
      }
    }
  }
}
