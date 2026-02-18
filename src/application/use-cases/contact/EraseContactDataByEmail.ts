import { IContactMessageRepository } from "@domain/contact/repositories/IContactMessageRepository";

/**
 * EraseContactDataByEmail Use Case
 *
 * Soft-deletes all ContactMessage records for a given email address.
 * Satisfies GDPR/CCPA "right to erasure" requests.
 * A background retention job (see scripts/contact_message_retention.sql)
 * performs the eventual hard-delete after the retention period.
 *
 * @layer Application
 */
export class EraseContactDataByEmail {
  constructor(
    private readonly contactMessageRepository: IContactMessageRepository,
  ) {}

  async execute(email: string): Promise<void> {
    await this.contactMessageRepository.softDeleteByEmail(email);
  }
}
