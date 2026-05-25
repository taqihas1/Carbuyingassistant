import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';

export default function App() {
  const [appReady, setAppReady] = useState(false);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar style="dark" />
        {!appReady && <SplashScreen onFinish={() => setAppReady(true)} />}
        {appReady && <AppNavigator />}
      </PaperProvider>
    </SafeAreaProvider>
  );
}
