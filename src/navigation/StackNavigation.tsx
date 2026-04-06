/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '@app/types';
import { useAppDispatch, useAppSelector } from '@app/store';
import Splash from '@screens/public/Splash';
import DrawerNavigation from './DrawerNavigation';

// ---- Auth Screens ----
import CreateAccount from '@app/screens/public/auth/CreateAccount';
import OtpVerification from '@app/screens/public/auth/OtpVerification';
import Login from '@app/screens/public/auth/Login';
import ForgotPassword from '@app/screens/public/auth/ForgotPassword';
import ResetPassword from '@app/screens/public/auth/ResetPassword';
import { navigationRef } from './RootNaivgation';
import { renderScreens } from './navigationUtils';
import { resetAuthDefaults } from '@app/store/slice/auth.slice';
import VonageCall from '@app/screens/protected/VonageCall';
import Notifications from '@app/screens/protected/Notifications';
import OnboardingStackNavigation from './OnboardingStackNavigation';

const Stack = createStackNavigator<RootStackParamList>();

export default function StackNavigation() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const isToken = useAppSelector(state => state.auth.token);
  const onBoardingStatus = useAppSelector(state => state.auth.onBoardingStatus);

  useEffect(() => {
    dispatch(resetAuthDefaults());
  }, []);

  const theme: Theme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: 'white' },
  };

  const AuthScreens: {
    [K in keyof RootStackParamList]: React.ComponentType<any>;
  } = {
    Login,
    CreateAccount,
    ForgotPassword,
    OtpVerification,
    ResetPassword,
  };

  // const OnboardingScreens: Partial<{
  //   [K in keyof RootStackParamList]: React.ComponentType<any>;
  // }> = {
  //   OnboardingStackParamList: OnboardingStackNavigation,
  // };

  const OnboardingScreens: Partial<{
    [K in keyof RootStackParamList]: React.ComponentType<any>;
  }> = {
    Onboarding: OnboardingStackNavigation,
  };

  const MainScreens: Partial<{
    [K in keyof RootStackParamList]: React.ComponentType<any>;
  }> = {
    DrawerNavigation,
    Notifications,
    VonageCall,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Splash />;
  }

  // const screens = isToken
  //   ? onBoardingStatus === 'completed'
  //     ? MainScreens
  //     : OnboardingScreens
  //   : AuthScreens;

  const screens = isToken
    ? onBoardingStatus === 'completed'
      ? MainScreens
      : OnboardingScreens
    : AuthScreens;

  return (
    <NavigationContainer ref={navigationRef} theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {renderScreens<RootStackParamList>(screens, Stack)}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
