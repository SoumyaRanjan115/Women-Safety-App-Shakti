import { ExpoConfig } from "@expo/config";

const config: ExpoConfig = {
  name: "Shakti — Women Safety App",
  slug: "women-safety-app",
  scheme: "shakti",


  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.sowmyaranjan.womensafety",   // ✅ REQUIRED
    googleServicesFile: "./app/google-services.json",
    versionCode: 1
  },

  extra: {
    eas: {
      projectId: "d168ce23-a141-4929-9d60-f3bfab376d21"
    },

    firebaseApiKey: "AIzaSyBaSejlktyJl4Dk3EeRzCQVmND8YnonkrI",
    firebaseAuthDomain: "women-safety-app-3cd27.firebaseapp.com",
    firebaseProjectId: "women-safety-app-3cd27",
    firebaseStorageBucket: "women-safety-app-3cd27.firebasestorage.app",
    firebaseMessagingSenderId: "703193379193",
    firebaseAppId: "1:703193379193:web:7312ea7b4392f04d9e3fa8"
  }
};

export default config;
