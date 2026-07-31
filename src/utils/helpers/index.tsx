import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from 'react-native-blob-util';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { MONTH_OPTIONS } from '../constants';
import moment from 'moment';

export const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

// Define the callback type for image responses
type ImageCallback = {
  uri: string;
  path: {
    name: string;
    type: string;
    uri: string;
  } | null;
};

// Define the input props type for the camera function
type ImagePickerProps = {
  isCrop?: boolean;
  callback: (res: ImageCallback) => void;
  size?: {
    width?: number;
    height?: number;
  };
  cropperCircleOverlay?: boolean;
};

type PickerImage = {
  path: string;
  mime: string;
};

// Utility function to format the image object
const formatImage = (image: PickerImage): ImageCallback['path'] => {
  const { path, mime } = image;
  const fileName = path.split('/').pop() || 'unknown';
  return {
    name: fileName,
    type: mime,
    // Keep the file:// scheme on iOS — stripping it makes React Native's
    // multipart upload send an empty file part, so images never actually save.
    uri: Platform.OS === 'android' ? path : path.startsWith('file://') ? path : `file://${path}`,
  };
};

// Function to pick an image from the gallery
export const getImageFromGallery = async ({
  isCrop = false,
  callback,
  size = { width: 400, height: 400 },
  cropperCircleOverlay = false,
}: ImagePickerProps): Promise<void> => {
  try {
    const image = await ImagePicker.openPicker({
      width: size.width,
      height: size.height,
      cropping: isCrop,
      mediaType: 'photo',
      cropperCircleOverlay: cropperCircleOverlay,
      cropperStatusBarColor: '#000000',
      cropperToolbarColor: '#FFFFFF',
      cropperToolbarWidgetColor: '#1E1F28',
      cropperActiveWidgetColor: '#3470E6',
      cropperToolbarTitle: 'Edit Photo',
      compressImageQuality: 0.8,
      forceJpg: true,
    });

    callback({
      uri: image.path,
      path: formatImage(image),
    });
  } catch (error) {
    console.error('Gallery Error:', error);
    callback({
      uri: '',
      path: null,
    });
  }
};

// Function to capture an image using the camera
export const getImageFromCamera = async ({
  isCrop = false,
  callback,
  size = { width: 400, height: 400 },
  cropperCircleOverlay = false,
}: ImagePickerProps): Promise<void> => {
  try {
    const image = await ImagePicker.openCamera({
      width: size.width,
      height: size.height,
      cropping: isCrop,
      mediaType: 'photo',
      cropperCircleOverlay: cropperCircleOverlay,
      cropperStatusBarColor: '#000000',
      cropperToolbarColor: '#FFFFFF',
      cropperToolbarWidgetColor: '#1E1F28',
      cropperActiveWidgetColor: '#3470E6',
      cropperToolbarTitle: 'Edit Photo',
      compressImageQuality: 0.8,
      forceJpg: true,
    });

    callback({
      uri: image.path,
      path: formatImage(image),
    });
  } catch (error) {
    console.error('Camera Error:', error);
    callback({
      uri: '',
      path: null,
    });
  }
};

export function hexToRGB(
  hex: string,
  opacity: number = 1,
  defaultColor: string = 'red',
): string {
  let c: string[] | number;

  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = parseInt(c.join(''), 16);

    return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(
      ',',
    )},${opacity})`;
  }

  return defaultColor;
}

export const getDaysInMonth = (
  monthIndex: number,
  year = new Date().getFullYear(),
) => new Date(year, monthIndex + 1, 0).getDate();

export const getDateOptions = (
  monthValue?: string,
  year = new Date().getFullYear(),
) => {
  if (!monthValue) return [];
  const monthIndex = MONTH_OPTIONS.findIndex(m => m.value === monthValue);
  if (monthIndex === -1) return [];
  return Array.from({ length: getDaysInMonth(monthIndex, year) }, (_, i) => ({
    label: `${i + 1}`,
    value: `${i + 1}`,
  }));
};

/**
 * Ask correct permission based on Android version
 */
// const requestStoragePermission = async (): Promise<boolean> => {
//   if (Platform.OS === 'android') {
//     if (Platform.Version >= 33) {
//       //  Android 13+ (API 33+) needs READ_MEDIA_IMAGES
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     } else if (Platform.Version >= 29) {
//       //  Android 10–12 (API 29–32) → scoped storage, no permission needed
//       return true;
//     } else {
//       //  Android 9 and below → WRITE_EXTERNAL_STORAGE required
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     }
//   }
//   // iOS automatically handles via CameraRoll
//   return true;
// };

/**
 * Save image from URL to gallery
 */
/**
 * Download image and let user save via system (Play Store compliant)
 */
/**
 * Download image and let user save/view via system (Play Store compliant)
 */

export const SaveToGallery = async (url: string, filename: string) => {
  try {
    const { fs } = RNFetchBlob;

    // App-private download directory (allowed)
    const downloadPath =
      Platform.OS === 'android'
        ? `${fs.dirs.DownloadDir}/${filename}`
        : `${fs.dirs.DocumentDir}/${filename}`;

    // Download file
    const res = await RNFetchBlob.config({
      fileCache: true,
      path: downloadPath,
    }).fetch('GET', url);

    const filePath = res.path();

    if (Platform.OS === 'android') {
      // ✅ Correct Android way (NO file:// exposure)
      await RNFetchBlob.android.actionViewIntent(filePath, 'image/*');
    } else {
      Alert.alert('Success', 'Image downloaded successfully');
    }
  } catch (err) {
    console.error('Save error:', err);
    Alert.alert('Error', 'Unable to download image');
  }
};

export const handleCall = (phoneNumber: string) => {
  if (!phoneNumber) {
    Alert.alert('Error', 'Phone number not available');
    return;
  }

  let phoneUrl = `tel:${phoneNumber}`;
  Linking.canOpenURL(phoneUrl)
    .then(supported => {
      // if (!supported) {
      //   Alert.alert('Error', 'Phone call not supported on this device');
      // } else {
      return Linking.openURL(phoneUrl);
      // }
    })
    .catch(err => console.error('Error opening dialer:', err));
};

export const handleEmail = (email: string, subject?: string, body?: string) => {
  if (!email) {
    Alert.alert('Error', 'Email address not available');
    return;
  }

  let emailUrl = `mailto:${email}`;
  const query = [];

  if (subject) query.push(`subject=${encodeURIComponent(subject)}`);
  if (body) query.push(`body=${encodeURIComponent(body)}`);

  if (query.length) emailUrl += `?${query.join('&')}`;

  Linking.canOpenURL(emailUrl)
    .then(supported => {
      // if (!supported) {
      //   Alert.alert('Error', 'Email app not available on this device');
      // } else {
      return Linking.openURL(emailUrl);
      // }
    })
    .catch(err => console.error('Error opening email app:', err));
};

export const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);

  // Format date like "20 Dec, 2025"
  const formattedDate = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Format time like "11:15 AM"
  const formattedTime = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return { formattedDate, formattedTime };
};

export const addDateSeparators = (messages: any[]) => {
  const finalList: any[] = [];
  let lastDate = '';

  messages.forEach(msg => {
    const date = moment(msg.createdAt).format('YYYY-MM-DD');

    if (date !== lastDate) {
      finalList.push({
        id: `date-${date}`,
        type: 'date',
        dateLabel: moment(date).calendar(null, {
          sameDay: '[Today]',
          lastDay: '[Yesterday]',
          lastWeek: 'dddd',
          sameElse: 'DD MMM YYYY',
        }),
      });
      lastDate = date;
    }

    finalList.push(msg);
  });

  return finalList;
};

export const getSimplePlaceName = async (latitude: any, longitude: any) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCZ7D7QHZVpzkpYgX91tznbypaCGqYKO8Y`,
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return null;
  } catch (error) {
    console.error('Error getting place name:', error);
    return null;
  }
};

export const getPlaceDetails = async (placeId: any) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=AIzaSyCZ7D7QHZVpzkpYgX91tznbypaCGqYKO8Y`,
    );
    const data = await response.json();
    if (data.result && data.result.geometry && data.result.geometry.location) {
      return {
        latitude: data.result.geometry.location.lat,
        longitude: data.result.geometry.location.lng,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
};

export const canJoinNow = (startDateTime: string) => {
  // Convert UTC → local
  const startTime = moment.utc(startDateTime).local();
  const now = moment();

  return now.isSameOrAfter(startTime);
};

export const formatPhoneNumber = (phone: string) => {
  if (!phone) return '';

  // keep digits and +
  const cleaned = phone.replace(/[^\d+]/g, '');

  let countryCode = '';
  let number = cleaned;

  // extract country code
  if (cleaned.startsWith('+')) {
    countryCode = cleaned.slice(0, 2); // +1
    number = cleaned.slice(2);
  }

  const digits = number.replace(/\D/g, '');

  if (digits.length < 4) {
    return `${countryCode} ${digits}`.trim();
  }

  if (digits.length < 7) {
    return `${countryCode} (${digits.slice(0, 3)}) ${digits.slice(3)}`.trim();
  }

  return `${countryCode} (${digits.slice(0, 3)}) ${digits.slice(
    3,
    6,
  )}-${digits.slice(6, 10)}`.trim();
};
