import { Platform, Linking } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import moment from 'moment';
import { pick, DocumentPickerResponse } from '@react-native-documents/picker';
import { showMessage } from './Toast';

/* =========================================================
   TYPES
========================================================= */

export type FileCallback = {
  uri: string;
  path: {
    name: string;
    type: string;
    uri: string;
  };
};

type FilePickerProps = {
  isMultiple?: boolean;
  callback: (res: FileCallback[]) => void;
};

/* =========================================================
   ALLOWED FILE TYPES
========================================================= */

const ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
];

const BLOCKED_EXTENSIONS = [
  'mp4',
  'mov',
  'avi',
  'mkv',
  'mp3',
  'wav',
  'aac',
  'apk',
];

/* =========================================================
   iOS PICKER TYPES (IMPORTANT FIX)
========================================================= */

const IOS_PICKER_TYPES = [
  'public.image',
  'com.adobe.pdf',
  'com.microsoft.word.doc',
  'org.openxmlformats.wordprocessingml.document',
  'com.microsoft.excel.xls',
  'org.openxmlformats.spreadsheetml.sheet',
  'com.microsoft.powerpoint.ppt',
  'org.openxmlformats.presentationml.presentation',
  'public.plain-text',
];

/* =========================================================
   FILE FORMATTER
========================================================= */

const formatFile = (file: DocumentPickerResponse) => {
  const fileName = file.name || file.uri.split('/').pop() || 'unknown';
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  return {
    name: fileName,
    type: file.type || file.nativeType || 'application/octet-stream',
    uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
    extension,
  };
};

/* =========================================================
   VALIDATION
========================================================= */

const isValidFile = (file: ReturnType<typeof formatFile>) => {
  if (BLOCKED_EXTENSIONS.includes(file.extension)) {
    return false;
  }

  if (!ALLOWED_EXTENSIONS.includes(file.extension)) {
    return false;
  }

  return true;
};

/* =========================================================
   PICK FILE (UPLOAD) — FIXED FOR iOS
========================================================= */

export const getFileFromLocal = async ({
  isMultiple = false,
  callback,
}: FilePickerProps): Promise<void> => {
  try {
    const results = await pick({
      allowMultiSelection: isMultiple,
      type: Platform.OS === 'ios' ? IOS_PICKER_TYPES : ['*/*'], // keep Android unchanged
    });

    const formatted = results
      .map(item => {
        const file = formatFile(item);

        if (!isValidFile(file)) {
          showMessage('Only images and document files are allowed');
          return null;
        }

        return {
          uri: item.uri,
          path: {
            name: file.name,
            type: file.type,
            uri: file.uri,
          },
        };
      })
      .filter(Boolean) as FileCallback[];

    callback(formatted);
  } catch (error) {
    console.error('Document Picker Error:', error);
    callback([]);
  }
};

/* =========================================================
   DOWNLOAD FILE
========================================================= */

export const downloadFile = async ({
  fileUrl,
  fileName,
}: {
  fileUrl: string;
  fileName: string;
}) => {
  try {
    console.log('[downloadFile] Called with:', { fileUrl, fileName });
    if (!fileUrl || !fileName || typeof fileName !== 'string') {
      showMessage('Invalid file information');
      return;
    }

    const cleanFileName = fileName.trim();
    if (!cleanFileName) {
      showMessage('Invalid file name');
      return;
    }

    const extension = cleanFileName.split('.').pop()?.toLowerCase() || '';

    if (BLOCKED_EXTENSIONS.includes(extension)) {
      showMessage('This file type is not supported');
      return;
    }

    const encodedUrl = encodeURI(fileUrl);
    const timestamp = moment().format('HH_mm_ss_');
    const safeFileName = cleanFileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    const downloadPath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${timestamp}${safeFileName}`
        : `${RNFS.DocumentDirectoryPath}/${timestamp}${safeFileName}`;

    console.log('[downloadFile] Starting download from:', encodedUrl, 'to:', downloadPath);

    const result = await RNFS.downloadFile({
      fromUrl: encodedUrl,
      toFile: downloadPath,
      background: false,
      discretionary: false,
    }).promise;

    console.log('[downloadFile] Download statusCode:', result?.statusCode);

    if (result && result.statusCode === 200) {
      if (Platform.OS === 'ios') {
        await shareFileiOS(downloadPath, cleanFileName);
      } else {
        try {
          await Share.open({
            url: `file://${downloadPath}`,
            type: getMimeType(cleanFileName),
            filename: cleanFileName,
          });
        } catch (shareErr: any) {
          console.log('[downloadFile] Android share dismissed/error:', shareErr);
          if (!shareErr?.message?.includes('User did not share') && !shareErr?.message?.includes('CANCELLED')) {
            showMessage('File downloaded successfully');
          }
        }
      }
    } else {
      console.log('[downloadFile] Fallback to Linking.openURL due to non-200 statusCode:', result?.statusCode);
      await Linking.openURL(encodedUrl).catch(err => {
        console.error('[downloadFile] Linking openURL failed:', err);
        showMessage('Unable to download file');
      });
    }
  } catch (error) {
    console.error('Download Error:', error);
    try {
      if (fileUrl) {
        await Linking.openURL(encodeURI(fileUrl));
      } else {
        showMessage('Unable to download file');
      }
    } catch (linkErr) {
      console.error('Linking Fallback Error:', linkErr);
      showMessage('Unable to download file');
    }
  }
};

/* =========================================================
   iOS SHARE
========================================================= */

const shareFileiOS = async (filePath: string, fileName: string) => {
  try {
    await Share.open({
      url: `file://${filePath}`,
      type: getMimeType(fileName),
      filename: fileName,
      saveToFiles: true,
    });

    showMessage('File saved successfully');
  } catch (error: any) {
    console.log('[shareFileiOS] Error / User Cancelled:', error);
    if (
      error?.message?.includes('User did not share') ||
      error?.message?.includes('CANCELLED') ||
      error?.message?.includes('dismiss')
    ) {
      return;
    }
    showMessage('File downloaded');
  }
};

/* =========================================================
   MIME TYPE HELPER
========================================================= */

const getMimeType = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
};
