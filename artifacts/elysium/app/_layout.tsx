import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ResonanceProvider } from "@/context/ResonanceContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#07021A" },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="orbit" />
      <Stack.Screen name="search" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="feed" />
      <Stack.Screen name="discover" />
      <Stack.Screen name="connections" />
      <Stack.Screen name="groups" />
      <Stack.Screen name="gather" />
      <Stack.Screen name="me" />
      <Stack.Screen name="composer" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="voice-party" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="story/[id]" options={{ presentation: "fullScreenModal", animation: "fade" }} />
      <Stack.Screen name="post/[id]" />
      <Stack.Screen name="hub/[id]" />
      <Stack.Screen name="messages/[id]" />
      <Stack.Screen name="profile/[id]" />
      <Stack.Screen name="tag/[name]" />
      <Stack.Screen name="ai-chat" />
      <Stack.Screen name="payment" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <ResonanceProvider>
                <StatusBar style="light" />
                <RootLayoutNav />
              </ResonanceProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
