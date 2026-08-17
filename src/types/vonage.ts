export interface VonageMessageInterface {
  _id?: string;
  id?: string;
  username?: string;
  message?: string;
  timestamp?: Date | string;
  connectionId?: string;
  type?: 'user' | 'system' | 'file';
  senderName?: string;
  createdAt?: string;
  updatedAt?: string;
  fileData?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    downloadUrl: string;
  };
}
