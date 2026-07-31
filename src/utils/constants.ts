import { DropDownOption } from '@app/components/common/DropDown';
import { Images } from '@app/themes';
import { ChatItem, DisputeStatus, SubscriptionPlan } from '@app/types';
import { BASE_URL, BASE_URL_LIVE, CDN_URL } from '@env';

// const base_url = BASE_URL;
const base_url = BASE_URL_LIVE;
// const base_url = 'http://192.168.5.212:1892';
// const base_url = 'https://c48f48cace81.ngrok-free.app';

console.log("base url==>", base_url)

export const URL_LIST = {
  base_url: base_url,
  api_base_url: base_url + '/api',
  bucket_url: CDN_URL,
};

// export const BUCKET_IMAGE_URL = {
//   profile_image_user: URL_LIST.bucket_url + '/uploads/user_profile_pic/',
//   profile_image: URL_LIST.bucket_url + '/uploads/interpreter_profile_pic/',
//   business_image: URL_LIST.bucket_url + '/uploads/user_business_logos/',
// };

export const API = {
  auth: {
    create_account: '/interpreter/signup/v2',
    signin: '/interpreter/signin',
    profile_setup: '/interpreter/update-profile',
    logout: '/interpreter/logout',
    delete_Account: '/user/delete',
    refreshToken: 'auth/refresh',
    forgot_password: '/interpreter/forgot-password',
    resend_otp: '/interpreter/resent-otp',
    verify_otp: '/interpreter/verify-otp',
    verify_password: '/interpreter/verify-resetpw-otp',
    forgot_change_password: '/interpreter/forget-password-change-password/v2',
    userDetails: '/interpreter/profile',
    setup_availibility: '/interpreter/availability/create-update',

  },
  default: {
    area_of_expertise_list: '/areaofexpertise/list',
    business_sector_list: '/business_sector/list',
    language_list: '/language/list',
    subscription_list: '/subscription/list',
    pricing_list: '/pricingplan/list',
    cms: '/cms/details',
  },
  user: {
    profile: '/interpreter/profile',
    update_profile: '/interpreter/update-profile',
    change_password: '/interpreter/change-password',
    type_wise: '/interpreter/type-wise',
    deleteAccount: '',
    listCards: '/user/listCard',
    create_payment: '/user/createPaymentIntent',
    paymentIntentCreate: '/user/createSetupIntent',
    add_card: '/user/addCard',
    deleteCard: '/user/deleteCard',
    add_bank_account: '/interpreter/addBankAccount',
    get_bank_list: '/interpreter/listBankAccounts',
    update_bank_status: '/interpreter/updateBankStatus',
    subscription_details: '/user/subscriptionDetails/',
    cancel_subscription: '/subscription/cancel',
    delete_certificate_document: '/interpreter/document-delete',
  },
  session: {
    getToken: '/session/getToken/',
    interpreterList: '/session/interpreter-list',
    interpreterDetails: '/session/details/',
    sendMsg: '/chat/history',
    getMsgHistory: '/chat/getHistory',
    uploadFile: '/chat/massage-file-upload',
    accept: '/session/approve/',
    decline: '/session/reject/',
    request_decline: '/session/decline/',
    sessionHistory: '/session/client-list/',
    sessionUpdateApprove: '/session/update-request/approve/',
    sessionUpdateReject: '/session/update-request/reject/',
    disputeList: '/dispute/interpreter/list',
    disputeDetails: '/dispute/interpreter-details/',
    raiseDispute: '/dispute/interpreter/create',
    disputeCategory: '/disputeCategory/list',
    disputeChatList: '/dispute-or-support/chat-list',
  },
  notification: {
    noti_list: '/notifications/list',
    unread_count: '/notifications/unread-count',
    unread_noti_list: '/notifications/unread',
    noti_details: '/notifications/',
    noti_delete: '/notifications/',
    noti_mark_all_read: '/notifications/read-all',
    delete_all: '/notifications/delete-all'
  },
  payment: {
    earning_list: '/payment/interpreter-earning-list',
    payout_list: '/payment/interpreter-payout-list',
    payout_details: '/payment/interpreter-payout-details',
    invoice_details: '/payment/interpreter-payout-invoice',
    taxEligibility: '/interpreter/tax-eligibility',
    tax_details: '/interpreter/generate-express-account-login-link'
  }
};

export const IMAGES_BUCKET_URL = {
  profile: URL_LIST.bucket_url + '/uploads/interpreter_profile_pic/',
  profile_user: URL_LIST.bucket_url + '/uploads/user_profile_pic/',
  certificates: URL_LIST.bucket_url + '/uploads/interpreter_certificate/',
  identitities: URL_LIST.bucket_url + '/uploads/interpreter_identity_proofs/',
  w9Form: URL_LIST.bucket_url + '/uploads/interpreter_w9_form/',
};

const TRIAL_TEXT = '+ Get 7 days free trial';

const FEATURES = {
  sessions: (value: string) => ({
    title: '# of sessions',
    subTitle: '(per month): ',
    value,
    status: true,
  }),
  frequency: (value: string) => ({
    title: 'Pay Frequency',
    value,
    status: true,
  }),
  priority: (value: boolean) => ({ title: 'Priority Response', status: value }),
  support: (value: boolean) => ({ title: '24/7 Support', status: value }),
};

export const SubscriptionPlans: SubscriptionPlan[] = [
  {
    price: null,
    plan: 'Free',
    type: 'Bronze',
    plans: [
      FEATURES.sessions('5'),
      FEATURES.frequency('Twice a month'),
      FEATURES.priority(false),
      FEATURES.support(false),
    ],
  },
  {
    price: 4.99,
    plan: 'month',
    trial: TRIAL_TEXT,
    type: 'Silver',
    plans: [
      FEATURES.sessions('20'),
      FEATURES.frequency('Weekly'),
      FEATURES.priority(true),
      FEATURES.support(true),
    ],
  },
  {
    price: 9.99,
    plan: 'month',
    trial: TRIAL_TEXT,
    type: 'Gold',
    plans: [
      FEATURES.sessions('Unlimited'),
      FEATURES.frequency('Weekly'),
      FEATURES.priority(true),
      FEATURES.support(true),
    ],
  },
];

export type Session = {
  id: string;
  name: string;
  location?: string;
  date?: string;
  time: string;
  gps?: string;
  icon: any;
  link?: string;
  isRequest?: boolean;
};

export const RequestSessions: Session[] = [
  {
    id: '1',
    name: 'Carla Kenter',
    location: '201 N Westshore Dr, Chicago',
    date: '12Jun',
    time: '10am - 1pm',
    gps: '47 W 13th St, New York, NY 10011, USA',
    icon: Images.in_user1,
    isRequest: true,
  },
  {
    id: '2',
    name: 'Muriel Walker-Schneider',
    location: '201 N Westshore Dr, Chicago',
    date: '12Jun',
    time: '10am - 1pm',
    gps: '47 W 13th St, New York, NY 10011, USA',
    icon: Images.in_user2,
  },
  {
    id: '3',
    name: 'Sidney Hills',
    location: '201 N Westshore Dr, Chicago',
    date: '12Jun',
    time: '10am - 1pm',
    gps: '47 W 13th St, New York, NY 10011, USA',
    icon: Images.in_user3,
  },
];

export const ScheduledSessions: Session[] = [
  {
    id: '1',
    name: 'Carla Kenter',
    location: '201 N Westshore Dr, Chicago',
    date: '12Jun',
    time: '10am - 1pm',
    gps: '47 W 13th St, New York, NY 10011, USA',
    icon: Images.in_user1,
    link: 'https://georgetown.zoom.us/j/774998944....',
  },
  {
    id: '2',
    name: 'Anne Lockman',
    location: '201 N Westshore Dr, Chicago',
    date: '12Jun',
    time: '10am - 1pm',
    gps: '47 W 13th St, New York, NY 10011, USA',
    icon: Images.in_user4,
    link: 'https://georgetown.zoom.us/j/774998944....',
  },
  {
    id: '3',
    name: 'Morris Rohan',
    location: '201 N Westshore Dr, Chicago',
    date: '12Jun',
    time: '10am - 1pm',
    gps: '47 W 13th St, New York, NY 10011, USA',
    icon: Images.in_user5,
    link: 'https://georgetown.zoom.us/j/774998944....',
  },
];

export const CompletedSessions: Session[] = [
  {
    id: '1',
    name: 'Carla Kenter',
    location: '201 N Westshore Dr, Chicago',
    date: '12Jun',
    time: '10am - 1pm',
    gps: '47 W 13th St, New York, NY 10011, USA',
    icon: Images.in_user1,
  },
  {
    id: '2',
    name: 'Blanda-Wintheiser',
    location: '201 N Westshore Dr, Chicago',
    date: '12Jun',
    time: '10am - 1pm',
    gps: '47 W 13th St, New York, NY 10011, USA',
    icon: Images.in_user6,
  },
  {
    id: '3',
    name: 'Parker',
    location: '201 N Westshore Dr, Chicago',
    date: '12Jun',
    time: '10am - 1pm',
    gps: '47 W 13th St, New York, NY 10011, USA',
    icon: Images.in_user7,
  },
];

export const TAB_TITLES = ['Date', 'Month', 'Type'];

export const TYPE_OPTIONS: DropDownOption[] = [
  { label: 'Audio', value: 'audio' },
  { label: 'Virtual', value: 'virtual' },
  { label: 'In Person', value: 'in_person' },
];

export const MONTH_OPTIONS: DropDownOption[] = [
  { label: 'January', value: 'january' },
  { label: 'February', value: 'february' },
  { label: 'March', value: 'march' },
  { label: 'April', value: 'april' },
  { label: 'May', value: 'may' },
  { label: 'June', value: 'june' },
  { label: 'July', value: 'july' },
  { label: 'August', value: 'august' },
  { label: 'September', value: 'september' },
  { label: 'October', value: 'october' },
  { label: 'November', value: 'november' },
  { label: 'December', value: 'december' },
];

export type Transaction = {
  id: string;
  title: string;
  date: string;
  amount: number;
};

export const TRANSACTION_SECTIONS = [
  {
    title: 'Latest Payments',
    data: [
      { id: '1', title: 'Bronze Plan', date: 'Jun 24, 11:14am', amount: 39 },
    ],
  },
  {
    title: 'February 2024',
    data: [
      { id: '2', title: 'Platinum Plan', date: 'Feb 24, 11:14am', amount: 89 },
      { id: '3', title: 'Gold Plan', date: 'Feb 24, 11:14am', amount: 79 },
      { id: '4', title: 'Silver Plan', date: 'Feb 24, 11:14am', amount: 49 },
      { id: '5', title: 'Silver Plan', date: 'Feb 24, 11:14am', amount: 49 },
    ],
  },
];

export const scheduleTimes = [
  {
    time: '1:00',
    name: 'Carla Kenter',
    lang: 'English - Spanish',
    duration: '2h',
    isVisible: true,
  },
  {
    time: '2:00',
    name: 'Liam Moreno',
    lang: 'Portuguese - French',
    duration: '1h',
    isVisible: false,
  },
  {
    time: '3:00',
    name: 'Sofia Turner',
    lang: 'Japanese - German',
    duration: '3h',
    isVisible: true,
  },
  {
    time: '4:00',
    name: 'Mateo Carter',
    lang: 'Spanish - Italian',
    duration: '2h',
    isVisible: false,
  },
  {
    time: '5:00',
    name: 'Isabella Cruz',
    lang: 'French - Portuguese',
    duration: '1h',
    isVisible: false,
  },
  {
    time: '6:00',
    name: 'Ethan Vargas',
    lang: 'German - Japanese',
    duration: '2h',
    isVisible: false,
  },
  {
    time: '7:00',
    name: 'Lucia Martin',
    lang: 'English - Chinese',
    duration: '3h',
    isVisible: true,
  },
  {
    time: '8:00',
    name: 'Noah Delgado',
    lang: 'Arabic - English',
    duration: '1h',
    isVisible: false,
  },
  {
    time: '9:00',
    name: 'Camila Reyes',
    lang: 'Russian - Spanish',
    duration: '2h',
    isVisible: false,
  },
  {
    time: '10:00',
    name: 'James Rivera',
    lang: 'English - Korean',
    duration: '1h',
    isVisible: false,
  },
  {
    time: '11:00',
    name: 'Valentina Ross',
    lang: 'French - German',
    duration: '3h',
    isVisible: true,
  },
  {
    time: '12:00',
    name: 'Lucas Perry',
    lang: 'Spanish - Portuguese',
    duration: '1h',
    isVisible: false,
  },
  {
    time: '13:00',
    name: 'Mia Alvarez',
    lang: 'English - Arabic',
    duration: '2h',
    isVisible: true,
  },
  {
    time: '14:00',
    name: 'Oliver Torres',
    lang: 'English - Italian',
    duration: '3h',
    isVisible: false,
  },
  {
    time: '15:00',
    name: 'Emma Castillo',
    lang: 'Japanese - English',
    duration: '2h',
    isVisible: true,
  },
  {
    time: '16:00',
    name: 'Benjamin Lopez',
    lang: 'German - French',
    duration: '1h',
    isVisible: false,
  },
  {
    time: '17:00',
    name: 'Victoria Hall',
    lang: 'English - Russian',
    duration: '2h',
    isVisible: true,
  },
  {
    time: '18:00',
    name: 'Sebastian Ward',
    lang: 'Spanish - Chinese',
    duration: '1h',
    isVisible: false,
  },
  {
    time: '19:00',
    name: 'Chloe Ruiz',
    lang: 'English - Portuguese',
    duration: '3h',
    isVisible: true,
  },
  {
    time: '20:00',
    name: 'Daniel Brooks',
    lang: 'Arabic - French',
    duration: '1h',
    isVisible: false,
  },
  {
    time: '21:00',
    name: 'Gabriela White',
    lang: 'Russian - German',
    duration: '2h',
    isVisible: true,
  },
  {
    time: '22:00',
    name: 'Alexander Cruz',
    lang: 'English - Hindi',
    duration: '3h',
    isVisible: false,
  },
  {
    time: '23:00',
    name: 'Natalia Stone',
    lang: 'Spanish - Arabic',
    duration: '1h',
    isVisible: true,
  },
  {
    time: '24:00',
    name: 'Michael Silva',
    lang: 'English - Japanese',
    duration: '2h',
    isVisible: false,
  },
];

export const transactions = [
  {
    id: '1',
    name: 'Seth Campbell',
    amount: '$79',
    time: 'Feb 24, 11:14am',
    image: Images.fbu6,
  },
  {
    id: '2',
    name: 'Joel Batz',
    amount: '$79',
    time: 'Feb 24, 11:14am',
    image: Images.fbu2,
  },
  {
    id: '3',
    name: 'Susan Ondricka',
    amount: '$49',
    time: 'Feb 24, 11:14am',
    image: Images.fbu3,
  },
  {
    id: '4',
    name: 'Otis Wiegand',
    amount: '$49',
    time: 'Feb 24, 11:14am',
    image: Images.fbu4,
  },
];

export interface Message {
  id: string;
  text?: string;
  time?: string;
  type: 'sent' | 'received' | 'date';
  avatar?: any;
  dateLabel?: string;
}

// include date as one item in array
export const messages: Message[] = [
  { id: 'date-1', type: 'date', dateLabel: 'Jan 06' },
  {
    id: '1',
    text: 'Hi Michelle',
    time: '05:29pm',
    type: 'sent',
    avatar: Images.user1,
  },
  {
    id: '2',
    text: "I've started working on your project and will have the first draft ready for you soon. I'll keep you updated on the progress.",
    time: '05:30pm',
    type: 'received',
    avatar: Images.user1,
  },
  {
    id: '3',
    text: 'Thank you for the update! I appreciate your efforts and look forward to seeing the first draft. Let me know if you need any further information from my side.',
    time: '05:30pm',
    type: 'received',
    avatar: Images.user1,
  },
  {
    id: '4',
    text: 'Thank you for the update! I appreciate your efforts and look forward to seeing the first draft. Let me know if you need any further information from my side.',
    time: '05:30pm',
    type: 'received',
    avatar: Images.user1,
  },
  {
    id: '5',
    text: 'Thank you for the update! I appreciate your efforts and look forward to seeing the first draft. Let me know if you need any further information from my side.',
    time: '05:30pm',
    type: 'received',
    avatar: Images.user1,
  },
];

export const chatData: ChatItem[] = [
  {
    id: '1',
    name: 'Michelle Robertson',
    message: 'I will send the update for wireframe.',
    time: '05:30pm',
    avatar: Images.chat_user1, // replace with your assets
  },
  {
    id: '2',
    name: 'Emerson Bator',
    message: 'I will send the update for wireframe.',
    time: '05:30pm',
    avatar: Images.chat_user2,
  },
  {
    id: '3',
    name: 'Jaxson Lipshutz',
    message: 'I will send the update for wireframe.',
    time: '05:30pm',
    avatar: Images.chat_user3,
  },
  {
    id: '4',
    name: 'James Stanton',
    message: 'I will send the update for wireframe.',
    time: '05:30pm',
    avatar: Images.chat_user4,
  },
  {
    id: '5',
    name: 'Marcus Press',
    message: 'I will send the update for wireframe.',
    time: '05:30pm',
    avatar: Images.chat_user5,
  },
  {
    id: '6',
    name: 'Phillip Culhane',
    message: 'I will send the update for wireframe.',
    time: '05:30pm',
    avatar: Images.chat_user6,
  },
  {
    id: '7',
    name: 'Alfredo Press',
    message: 'I will send the update for wireframe.',
    time: '05:30pm',
    avatar: Images.chat_user7,
  },
];

export interface Dispute {
  id: string;
  title: string;
  code: string;
  client: string;
  description: string;
  date: string;
  time: string;
  status: DisputeStatus;
}

export const disputesData: Dispute[] = [
  {
    id: '1',
    title: 'Voice Not Clear',
    code: '#P2345',
    client: 'Jack Tyson',
    description:
      'Office ipsum you must be muted. Before up sandwich cob businesses bed stand all production. Club eod sorry offline today cta ground business.',
    date: '12 October, 2023',
    time: '4:15PM',
    status: 'Pending',
  },
  {
    id: '2',
    title: 'Voice Not Clear',
    code: '#P2346',
    client: 'Jack Tyson',
    description:
      'Office ipsum you must be muted. Before up sandwich cob businesses bed stand all production. Club eod sorry offline today cta ground business.',
    date: '12 October, 2023',
    time: '4:15PM',
    status: 'Declined',
  },
  {
    id: '3',
    title: 'Voice Not Clear',
    code: '#P2347',
    client: 'Jack Tyson',
    description:
      'Office ipsum you must be muted. Before up sandwich cob businesses bed stand all production. Club eod sorry offline today cta ground business.',
    date: '12 October, 2023',
    time: '4:15PM',
    status: 'Resolved',
  },
];
