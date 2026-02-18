import { IContactMessageRepository } from "@domain/contact/repositories/IContactMessageRepository";
import { InquiryType } from "@domain/contact/InquiryType";

export interface SubmitContactMessageDTO {
  fullName: string;
  email: string;
  inquiryType: InquiryType;
  message: string;
}

export class SubmitContactMessage {
  constructor(private readonly repository: IContactMessageRepository) {}

  async execute(dto: SubmitContactMessageDTO): Promise<void> {
    await this.repository.save(dto);
  }
}
