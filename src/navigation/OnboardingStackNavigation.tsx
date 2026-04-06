import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileSetup from '@app/screens/public/auth/SetUpProfile/ProfileSetup';
import AvailabilitySetup from '@app/screens/public/auth/SetUpProfile/AvailabilitySetup';
import PersonaValidation from '@app/screens/public/auth/SetUpProfile/PersonaValidation';
import { OnboardingStackParamList } from '@app/types';
import Success from '@app/screens/default/Success';
import InitialOnboarding from '@app/screens/public/auth/SetUpProfile/InitialOnboarding';
import SubscriptionSetUp from '@app/screens/public/auth/SetUpProfile/SubscriptionSetUp';
import SubscriptionPlanDetails from '@app/screens/public/auth/SetUpProfile/SubscriptionSetUpPlanDetails';
import AddPaymentCard from '@app/screens/public/auth/SetUpProfile/AddPaymentCard';
import AddBankAccount from '@app/screens/public/auth/SetUpProfile/AddBankAccount';
import OnboardingResolver from './OnboardingResolver';
import { BackHandler } from 'react-native';
const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingStackNavigation = () => {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true, // block back button
    );

    return () => backHandler.remove();
  }, []);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingResolver" component={OnboardingResolver} />
      <Stack.Screen name="InitialOnboarding" component={InitialOnboarding} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
      <Stack.Screen name="PersonaValidation" component={PersonaValidation} />
      <Stack.Screen name="AvailabilitySetup" component={AvailabilitySetup} />
      <Stack.Screen name="AddPaymentCard" component={AddPaymentCard} />
      <Stack.Screen name="SubscriptionSetup" component={SubscriptionSetUp} />
      <Stack.Screen
        name="SubscriptionPlanDetails"
        component={SubscriptionPlanDetails}
      />
      <Stack.Screen name="AddBankAccount" component={AddBankAccount} />
      <Stack.Screen name="Success" component={Success} />
    </Stack.Navigator>
  );
};

export default OnboardingStackNavigation;
