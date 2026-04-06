export interface VonageMessageInterface {
  id: string;
  username: string;
  message?: string; // Make optional
  timestamp: Date;
  connectionId: string;
  type: 'user' | 'system' | 'file'; // Add file type
  senderName?: string;
  fileData?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    downloadUrl: string;
  };
}
