import { NavigatorScreenParams } from "@react-navigation/native";

type SuccessScreenProps = {
  title?: string;
  title1?: string;
  title2?: string;
  title4?: string;
  subTitle?: string;
  details?: string;
  isInfo?: boolean;
  type?:
  | 'ResetPassword'
  | 'BankAccountAdd'
  | 'Transaction'
  | 'SessionAccepted'
  | 'SessionDeclined'
  | 'Cancelled'
  | 'DisputeDeclined'
  | 'DisputeAccepted'
  | 'BankRemoved'
  | 'AccountUpdate'
  | 'LinkAccount'
  | 'ChangePassword'
  | 'SubscriptionCancel'
  | 'SubscriptionSuccess'
  | 'RaiseDispute'
  | 'Logout'
  | 'ProfileSave';
};

type JoiningLoaderProps = {
  type: 'Session' | 'Chat';
  title: string;
};

export type VonageCallProps = {
  oponentUserName: string;
  oponentUserId: string;
  oponentUserProfileImage: string;
};

export type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  OtpVerification: {
    type: 'Forgot' | 'CreateAccount';
    phoneOrEmail: string;
  };
  ForgotPassword: undefined;
  ResetPassword: {
    phoneOrEmail: string;
  };
  Success?: SuccessScreenProps;
  Onboarding: undefined;   // <-- ADD THIS
  // OnboardingStackParamList?: OnboardingStackParamList;
  DrawerNavigation?: undefined;
  VonageCall?: VonageCallProps;
  Notifications?: undefined;
};

export type OnboardingStackParamList = {
  OnboardingResolver: undefined;
  InitialOnboarding: undefined;
  ProfileSetup: undefined;
  PersonaValidation: undefined;
  AvailabilitySetup: undefined;
  AddPaymentCard: undefined;
  SubscriptionSetup: undefined;
  SubscriptionPlanDetails: { planId: string };
  AddBankAccount: undefined;
  Success: SuccessScreenProps;
};

export type SessionType = 'Requests' | 'Scheduled' | 'Completed';
export type DisputeStatus = 'Pending' | 'Declined' | 'Resolved';

export type DashboardStackParamList = {
  Home: undefined;
  SessionViewList: {
    type: SessionType;
  };
  SessionDetails: {
    details: any;
    type: 'RequestDetails' | 'ScheduledDetails';
    from: string;
  };
  RaiseDispute: {
    item: any;
  };
  Success: SuccessScreenProps;
};

export type SessionHistoryParamList = {
  History: undefined;
  JoiningLoader: JoiningLoaderProps;
  VideoCall: undefined;
  ChatDetails: {
    sessionId: string;
    name: string;
  };
};

export type ChatHistoryStackParamList = {
  ChatList: undefined;
  ChatDetails: {
    sessionId: string;
    name: string;
  };
};

export type RaiseDisputeStackParamList = {
  RaiseDispute: {
    item: any;
  }
  Dispute: {
    item: any;
  };
  Success: SuccessScreenProps;
};

export type DisputeManagementStackParamList = {
  Management: undefined;
  Success: SuccessScreenProps;
};

export type EarningsPayoutStackParamList = {
  EarningsPayoutList: undefined;
  TransactionHistory: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Success: SuccessScreenProps;
};

export type SettingsStackParamList = {
  Settings: undefined;
  PaymentSettings: undefined;
  ChangePassword: undefined;
  Success: SuccessScreenProps;
  AvailabilitySetup: {
    type: 'Select' | 'Update';
  };
  SubscriptionDetails: undefined;
  UpgradeSubscriptionList: undefined;
  UpgradeSubscriptionDetails: { planId: string };
};

export type HelpSupportStackParamList = {
  HelpAndSupport: undefined;
  CustomerSupport: undefined;
  JoiningLoader: JoiningLoaderProps;
  SupportChat: undefined;
  DisputeList: {
    list_type: string;
  }
};

export type RootDrawerParamList = {
  Dashboard: undefined;
  SessionHistory: undefined;
  Calendar: undefined;
  ChatHistory: undefined;
  RaiseDispute: {
    item: any
  };
  // DisputeManagement?: undefined;
  EarningsPayout: undefined;
  Profile: undefined;
  Settings: undefined;
  HelpSupport: undefined;
};

// -------------------------- SUBSCRIPTION PROPS ----------------------------------
export interface PlanFeature {
  title: string;
  subTitle?: string;
  value?: string;
  status: boolean;
}
export interface SubscriptionPlan {
  price: number | null;
  plan: string;
  trial?: string;
  type: string;
  plans: PlanFeature[];
}

// -------------------------- API PROPS ----------------------------------
export interface SIGN_UP_TYPE {
  email: string;
  password: string;
  confirm_password: string;
}

export interface SIGN_IN_TYPE {
  username: string;
  password: string;
  expiresInMins: number;
}

export interface UPDATE_USER_INFORMATION {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: any;
}

// -------------------------- CHAT PROPS ----------------------------------
export interface ChatItem {
  _id: string;
  vonage_session_id: string;
  client_profile_image: string;
  client: string;
  start_date_time: string;
  session_ref_number: string;
}

export interface AppNotification {
  notification?: {
    android?: {
      sound?: string;
    };
  };
  originalPriority: number;
  priority: number;
  sentTime: number;
  data: {
    session_id: string;
    type: string;
    uid: string;
  };
  from?: string;
  messageId: string;
  ttl?: number;
  collapseKey?: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}
