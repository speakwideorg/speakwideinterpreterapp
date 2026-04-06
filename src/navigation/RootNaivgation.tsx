import {
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native';
import {
  ChatHistoryStackParamList,
  DashboardStackParamList,
  DisputeManagementStackParamList,
  EarningsPayoutStackParamList,
  HelpSupportStackParamList,
  OnboardingStackParamList,
  ProfileStackParamList,
  RaiseDisputeStackParamList,
  RootDrawerParamList,
  RootStackParamList,
  SessionHistoryParamList,
  SettingsStackParamList,
} from '@app/types';

type AllParamLists = RootStackParamList &
  OnboardingStackParamList &
  RootDrawerParamList &
  DashboardStackParamList &
  SessionHistoryParamList &
  ChatHistoryStackParamList &
  RaiseDisputeStackParamList &
  DisputeManagementStackParamList &
  EarningsPayoutStackParamList &
  SettingsStackParamList &
  ProfileStackParamList &
  HelpSupportStackParamList;

export type AllRoutes = {
  [K in keyof AllParamLists]: AllParamLists[K];
};

// Create navigation reference with typed RootStackParamList
export const navigationRef = createNavigationContainerRef<AllRoutes>();

// Navigate function with correct typing and format
export function navigate<RouteName extends keyof AllRoutes>( // (RootStackParamList & SettingsStackProps)>
  name: RouteName,
  // params?: (RootStackParamList & SettingsStackProps)[RouteName]
  params?: AllRoutes[RouteName],
) {
  if (navigationRef.isReady()) {
    // Remove `{ params }` wrapper to match `navigate` method requirements
    navigationRef.navigate(name as any, params);
  }
}

// Replace function with correct typing and format
export function replace<RouteName extends keyof AllRoutes>(
  name: RouteName,
  params?: AllRoutes[RouteName],
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name as any, { params })); // Adjust format
  }
}

// Go back function
export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

// Reset navigation stack
export function reset(index: number, name: keyof AllRoutes) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: index,
      routes: [{ name: name as any }], // Use 'as any' if there's a type mismatch
    });
  }
}

// Pop function for going back N screens
export function canGoBack(num: number) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.pop(num));
  }
}
