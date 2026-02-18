import { InquiryType } from "@domain/contact/InquiryType";

export interface ContactMessageData {
  fullName: string;
  email: string;
  inquiryType: InquiryType;
  message: string;
}

export interface IContactMessageRepository {
  save(data: ContactMessageData): Promise<void>;
  softDeleteByEmail(email: string): Promise<void>;
}
