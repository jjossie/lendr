import type {StorageManager} from "native-base";
import {ColorMode, extendTheme, NativeBaseProvider} from "native-base";

import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Epilogue_100Thin,
  Epilogue_300Light,
  Epilogue_500Medium,
  Epilogue_700Bold,
  Epilogue_900Black,
  useFonts,
} from "@expo-google-fonts/epilogue";

// SplashScreen.preventAutoHideAsync();

const newColorTheme = {
  primary: {
    50: '#e9f8ed',
    100: '#cce5d3',
    200: '#add2b8',
    300: '#8dbf9c',
    400: '#6eac80',
    500: '#559466',
    600: '#417350',
    700: '#2d5238',
    800: '#193121',
    900: '#011206',
  },
  brand: {
    50: '#ebf7e9',
    100: '#d2e1ce',
    200: '#b8ccb1',
    300: '#9cb694',
    400: '#81a277',
    500: '#68885d',
    600: '#506a48',
    700: '#394c32',
    800: '#212e1c',
    900: '#071100',
  },
  secondary: {
    50: '#ffe6e6',
    100: '#f7bfbd',
    200: '#ec9794',
    300: '#e26e69',
    400: '#d94640',
    500: '#bf2c26',
    600: '#96221d',
    700: '#6b1714',
    800: '#430c0a',
    900: '#1d0100',
  },
  ivory: {
    100: "#f5fbef",
  },
};
const newFontTheme = {
  Epilogue: {
    100: {
      normal: "Epilogue_100Thin",
      // italic: "Epilogue_100Thin-Italic",
    },
    200: {
      normal: "Epilogue_100Thin",
      // italic: "Epilogue_100Thin-Italic",
    },
    300: {
      normal: "Epilogue_300Light",
      // italic: "Epilogue_300Light-Italic",
    },
    400: {
      normal: "Epilogue_300Light",
      // italic: "Epilogue_300Light",
    },
    500: {
      normal: "Epilogue_500Medium",
    },
    600: {
      normal: "Epilogue_500Medium",
      // italic: "Epilogue_500Medium-Italic",
    },
    700: {
      normal: 'Epilogue_700Bold',
    },
    800: {
      normal: 'Epilogue_700Bold',
      // italic: 'Epilogue_700Bold-Italic',
    },
    900: {
      normal: 'Epilogue_900Black',
      // italic: 'Epilogue-Italic',
    },
  },
};

const theme = extendTheme({
  colors: newColorTheme,
  fontConfig: newFontTheme,
  fonts: {
    heading: "Epilogue",
    body: "Epilogue",
  },
  components: {
    Button: {
      // Can simply pass default props to change default behaviour of components.
      baseStyle: {
        rounded: 'md',
      },
      defaultProps: {
        fontWeight: "bold"
      }
    },
  }
});

const colorModeManager: StorageManager = {
  get: async () => {
    try {
      let val = await AsyncStorage.getItem("@my-app-color-mode");
      return val === "dark" ? "dark" : "light";
    } catch (e) {
      console.log(e);
      return "light";
    }
  },
  set: async (value: ColorMode) => {
    try {
      await AsyncStorage.setItem("@my-app-color-mode", value ?? "light");
    } catch (e) {
      console.log(e);
    }
  },
};


export const CustomNativeBaseProvider = ({children}: any) => {
  const [fontsLoaded] = useFonts({
    Epilogue_100Thin,
    Epilogue_300Light,
    Epilogue_500Medium,
    Epilogue_700Bold,
    Epilogue_900Black,
  });

  if (!fontsLoaded)
    return null;

  // const onLayoutRootView = useCallback(async () => {
  //   if (fontsLoaded) {
  //     await SplashScreen.hideAsync();
  //   }
  // }, [fontsLoaded]);

  return (
      <NativeBaseProvider theme={theme} colorModeManager={colorModeManager}>
        {/*<View onLayout={onLayoutRootView}>{children}</View>*/}
        {children}
      </NativeBaseProvider>
  );
};