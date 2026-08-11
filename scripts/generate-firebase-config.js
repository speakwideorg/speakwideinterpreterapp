const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// Helper to load env variables from a .env file if process.env doesn't have them
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  const envVars = { ...process.env };

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split(/\r?\n/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          let value = trimmed.substring(eqIdx + 1).trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (!envVars[key]) {
            envVars[key] = value;
          }
        }
      }
    });
  }
  return envVars;
}

const env = loadEnv();

// Firebase values with fallbacks matching project default values if needed
const FIREBASE_PROJECT_NUMBER = env.FIREBASE_PROJECT_NUMBER || '465095096232';
const FIREBASE_PROJECT_ID = env.FIREBASE_PROJECT_ID || 'speakwide-23158';
const FIREBASE_STORAGE_BUCKET = env.FIREBASE_STORAGE_BUCKET || 'speakwide-23158.firebasestorage.app';

const FIREBASE_ANDROID_APP_ID = env.FIREBASE_ANDROID_APP_ID || '1:465095096232:android:0b6e035c96154b426d0f9d';
const FIREBASE_ANDROID_API_KEY = env.FIREBASE_ANDROID_API_KEY || 'AIzaSyDYxKCq_gz8Mf5cHg9bR-L5f5iQIq8VEQY';
const FIREBASE_ANDROID_PACKAGE_NAME = env.FIREBASE_ANDROID_PACKAGE_NAME || 'com.speakwideinterpreter';

const FIREBASE_IOS_APP_ID = env.FIREBASE_IOS_APP_ID || '1:465095096232:ios:7c0e750df0f556f16d0f9d';
const FIREBASE_IOS_API_KEY = env.FIREBASE_IOS_API_KEY || 'AIzaSyB2i8IxysEMQE9hHTYsaAmv9p4fXRT434A';
const FIREBASE_IOS_BUNDLE_ID = env.FIREBASE_IOS_BUNDLE_ID || 'com.speakwideinterpreter.app';

// 1. Generate google-services.json for Android
const googleServicesJson = {
  project_info: {
    project_number: FIREBASE_PROJECT_NUMBER,
    project_id: FIREBASE_PROJECT_ID,
    storage_bucket: FIREBASE_STORAGE_BUCKET,
  },
  client: [
    {
      client_info: {
        mobilesdk_app_id: FIREBASE_ANDROID_APP_ID,
        android_client_info: {
          package_name: FIREBASE_ANDROID_PACKAGE_NAME,
        },
      },
      oauth_client: [],
      api_key: [
        {
          current_key: FIREBASE_ANDROID_API_KEY,
        },
      ],
      services: {
        appinvite_service: {
          other_platform_oauth_client: [],
        },
      },
    },
  ],
  configuration_version: '1',
};

const androidTargetDir = path.join(rootDir, 'android', 'app');
if (!fs.existsSync(androidTargetDir)) {
  fs.mkdirSync(androidTargetDir, { recursive: true });
}
const androidTargetPath = path.join(androidTargetDir, 'google-services.json');
fs.writeFileSync(androidTargetPath, JSON.stringify(googleServicesJson, null, 2), 'utf8');
console.log(`[Firebase Generator] Successfully generated ${androidTargetPath}`);

// 2. Generate GoogleService-Info.plist for iOS
const googleServiceInfoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>API_KEY</key>
	<string>${FIREBASE_IOS_API_KEY}</string>
	<key>GCM_SENDER_ID</key>
	<string>${FIREBASE_PROJECT_NUMBER}</string>
	<key>PLIST_VERSION</key>
	<string>1</string>
	<key>BUNDLE_ID</key>
	<string>${FIREBASE_IOS_BUNDLE_ID}</string>
	<key>PROJECT_ID</key>
	<string>${FIREBASE_PROJECT_ID}</string>
	<key>STORAGE_BUCKET</key>
	<string>${FIREBASE_STORAGE_BUCKET}</string>
	<key>IS_ADS_ENABLED</key>
	<false></false>
	<key>IS_ANALYTICS_ENABLED</key>
	<false></false>
	<key>IS_APPINVITE_ENABLED</key>
	<true></true>
	<key>IS_GCM_ENABLED</key>
	<true></true>
	<key>IS_SIGNIN_ENABLED</key>
	<true></true>
	<key>GOOGLE_APP_ID</key>
	<string>${FIREBASE_IOS_APP_ID}</string>
</dict>
</plist>
`;

const iosTargetDir = path.join(rootDir, 'ios', 'SpeakwideInterpreter');
if (!fs.existsSync(iosTargetDir)) {
  fs.mkdirSync(iosTargetDir, { recursive: true });
}
const iosTargetPath = path.join(iosTargetDir, 'GoogleService-Info.plist');
fs.writeFileSync(iosTargetPath, googleServiceInfoPlist, 'utf8');
console.log(`[Firebase Generator] Successfully generated ${iosTargetPath}`);
