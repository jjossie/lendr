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
  brand: {
    900: "#8287af",
    800: "#7c83db",
    700: "#b3bef6",
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