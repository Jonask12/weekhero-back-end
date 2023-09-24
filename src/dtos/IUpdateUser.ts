export interface IPpdateUser {
  name: string;
  oldPassword: string;
  newPassword: string;
  avatar_url?: FileUpdate;
  user_id: string;
}

interface FileUpdate {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}