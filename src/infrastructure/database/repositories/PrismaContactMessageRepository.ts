import {
  type PrismaClient,
  InquiryType as PrismaInquiryType,
} from "@prisma/client";
import {
  IContactMessageRepository,
  ContactMessageData,
} from "@domain/contact/repositories/IContactMessageRepository";
import { InquiryType } from "@domain/contact/InquiryType";

const INQUIRY_TYPE_MAP: Record<InquiryType, PrismaInquiryType> = {
  [InquiryType.FEEDBACK]: PrismaInquiryType.FEEDBACK,
  [InquiryType.BUG_REPORT]: PrismaInquiryType.BUG_REPORT,
  [InquiryType.FEATURE_REQUEST]: PrismaInquiryType.FEATURE_REQUEST,
  [InquiryType.SUGGESTION]: PrismaInquiryType.SUGGESTION,
  [InquiryType.GENERAL_INQUIRY]: PrismaInquiryType.GENERAL_INQUIRY,
};

export class PrismaContactMessageRepository implements IContactMessageRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(data: ContactMessageData): Promise<void> {
    await this.db.contactMessage.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        inquiryType: INQUIRY_TYPE_MAP[data.inquiryType],
        message: data.message,
      },
    });
  }

  async softDeleteByEmail(email: string): Promise<void> {
    await this.db.contactMessage.updateMany({
      where: { email, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
