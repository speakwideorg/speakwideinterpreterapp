import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import CustomDrawer from './CustomDrawer';
import {
  ChatHistoryStackParamList,
  DashboardStackParamList,
  DisputeManagementStackParamList,
  EarningsPayoutStackParamList,
  HelpSupportStackParamList,
  ProfileStackParamList,
  RaiseDisputeStackParamList,
  RootDrawerParamList,
  SessionHistoryParamList,
  SettingsStackParamList,
} from '@app/types';
import Home from '@app/screens/protected/Dashboard';
import { renderScreens } from './navigationUtils';
import SessionDetails from '@app/screens/protected/Dashboard/SessionDetails';
import Calender from '@app/screens/protected/Calender';
import SessionHistoryScreen from '@app/screens/protected/SessionHistory';
import JoiningLoader from '@app/screens/default/JoiningLoader';
import VideoCall from '@app/screens/protected/SessionHistory/VideoCall';
import ChatList from '@app/screens/protected/Chat/ChatList';
import ChatDetails from '@app/screens/protected/Chat/ChatDetails';
import RaiseDisputeScreen from '@app/screens/protected/RaiseDispute';
import Success from '@app/screens/default/Success';
import DisputeManagementScreen from '@app/screens/protected/DisputeManagement';
import EarningsPayoutScreen from '@app/screens/protected/EarningsPayout';
import TransactionHistory from '@app/screens/protected/EarningsPayout/TransactionHistory';
import ProfileScreen from '@app/screens/protected/Profile';
import EditProfile from '@app/screens/protected/Profile/EditProfile';
import SessionViewList from '@app/screens/protected/Dashboard/SessionViewList';
import AvailabilitySetup from '@app/screens/default/AvailabilitySetup';
import SettingsScreen from '@app/screens/protected/settings';
import PaymentSettings from '@app/screens/protected/settings/PaymentSettings';
import ChangePassword from '@app/screens/protected/settings/ChangePassword';
import SubscriptionDetails from '@app/screens/protected/settings/SubscriptionDetails';
import UpgradeSubscriptionList from '@app/screens/protected/settings/UpgradeSubscriptionList';
import UpgradeSubscriptionDetails from '@app/screens/protected/settings/UpgradeSubscriptionDetails';
import DisputeList from '@app/screens/protected/HelpSupport/DisputeList';
import HelpSupportScreen from '@app/screens/protected/HelpSupport/index';
import CustomerSupport from '@app/screens/protected/HelpSupport/CustomerSupport';
import SupportChat from '@app/screens/protected/HelpSupport/SupportChat';

const Drawer = createDrawerNavigator<RootDrawerParamList>();
const DashboardStack = createStackNavigator<DashboardStackParamList>();
const SessionHistoryStack = createStackNavigator<SessionHistoryParamList>();
const ChatHistoryStack = createStackNavigator<ChatHistoryStackParamList>();
const RaiseDisputeStack = createStackNavigator<RaiseDisputeStackParamList>();
const DisputeManagementStack =
  createStackNavigator<DisputeManagementStackParamList>();
const EarningsPayoutStack =
  createStackNavigator<EarningsPayoutStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();
const HelpSupportStack = createStackNavigator<HelpSupportStackParamList>();

const Dashboard = () => {
  const screens: {
    [K in keyof DashboardStackParamList]: React.ComponentType<any>;
  } = {
    Home,
    SessionViewList,
    SessionDetails,
    Success,
    RaiseDispute: RaiseDisputeScreen,
  };

  return (
    <DashboardStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Home"
    >
      {renderScreens<DashboardStackParamList>(screens, DashboardStack)}
    </DashboardStack.Navigator>
  );
};

const HelpSupport = () => {
  const screens: {
    [K in keyof HelpSupportStackParamList]: React.ComponentType<any>;
  } = {
    HelpAndSupport: HelpSupportScreen,
    CustomerSupport,
    JoiningLoader,
    DisputeList: DisputeList,
    SupportChat,
  };

  return (
    <HelpSupportStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="HelpAndSupport"
    >
      {renderScreens<HelpSupportStackParamList>(screens, HelpSupportStack)}
    </HelpSupportStack.Navigator>
  );
};

const SessionHistory = () => {
  const screens: {
    [K in keyof SessionHistoryParamList]: React.ComponentType<any>;
  } = {
    History: SessionHistoryScreen,
    JoiningLoader: JoiningLoader,
    VideoCall: VideoCall,
    ChatDetails: ChatDetails,
  };

  return (
    <SessionHistoryStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="History"
    >
      {renderScreens<SessionHistoryParamList>(screens, SessionHistoryStack)}
    </SessionHistoryStack.Navigator>
  );
};

const ChatHistory = () => {
  const screens: {
    [K in keyof ChatHistoryStackParamList]: React.ComponentType<any>;
  } = {
    ChatList: ChatList,
    ChatDetails: ChatDetails,
  };

  return (
    <ChatHistoryStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="ChatList"
    >
      {renderScreens<ChatHistoryStackParamList>(screens, ChatHistoryStack)}
    </ChatHistoryStack.Navigator>
  );
};

const RaiseDispute = () => {
  const screens: {
    [K in keyof RaiseDisputeStackParamList]: React.ComponentType<any>;
  } = {
    Dispute: RaiseDisputeScreen,
    Success: Success,
  };

  return (
    <RaiseDisputeStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Dispute"
    >
      {renderScreens<RaiseDisputeStackParamList>(screens, RaiseDisputeStack)}
    </RaiseDisputeStack.Navigator>
  );
};

const DisputeManagement = () => {
  const screens: {
    [K in keyof DisputeManagementStackParamList]: React.ComponentType<any>;
  } = {
    Management: DisputeManagementScreen,
    Success: Success,
  };

  return (
    <DisputeManagementStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Management"
    >
      {renderScreens<DisputeManagementStackParamList>(
        screens,
        DisputeManagementStack,
      )}
    </DisputeManagementStack.Navigator>
  );
};

const EarningsPayout = () => {
  const screens: {
    [K in keyof EarningsPayoutStackParamList]: React.ComponentType<any>;
  } = {
    EarningsPayoutList: EarningsPayoutScreen,
    TransactionHistory: TransactionHistory,
  };

  return (
    <EarningsPayoutStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="EarningsPayoutList"
    >
      {renderScreens<EarningsPayoutStackParamList>(
        screens,
        EarningsPayoutStack,
      )}
    </EarningsPayoutStack.Navigator>
  );
};

const Profile = () => {
  const screens: {
    [K in keyof ProfileStackParamList]: React.ComponentType<any>;
  } = {
    Profile: ProfileScreen,
    EditProfile,
    Success,
  };

  return (
    <ProfileStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Profile"
    >
      {renderScreens<ProfileStackParamList>(screens, ProfileStack)}
    </ProfileStack.Navigator>
  );
};

const Settings = () => {
  const screens: {
    [K in keyof SettingsStackParamList]: React.ComponentType<any>;
  } = {
    Settings: SettingsScreen,
    PaymentSettings,
    ChangePassword,
    Success,
    AvailabilitySetup,
    SubscriptionDetails,
    UpgradeSubscriptionList,
    UpgradeSubscriptionDetails,
  };

  return (
    <SettingsStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Settings"
    >
      {renderScreens<SettingsStackParamList>(screens, SettingsStack)}
    </SettingsStack.Navigator>
  );
};

const DrawerNavigation = () => {
  const drawerScreens: {
    [K in keyof RootDrawerParamList]: React.ComponentType<any>;
  } = {
    Dashboard,
    Calendar: Calender,
    SessionHistory,
    ChatHistory,
    // RaiseDispute,
    // DisputeManagement,
    EarningsPayout,
    Profile,
    Settings,
    HelpSupport,
  };

  const renderDrawerContent = (props: any) => {
    return <CustomDrawer {...props} />;
  };

  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.2)',
        drawerStyle: {
          width: 250,
          backgroundColor: 'transparent',
        },
      }}
      drawerContent={renderDrawerContent}
    >
      {renderScreens<RootDrawerParamList>(drawerScreens, Drawer)}
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;
