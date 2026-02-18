import { prisma } from "@infrastructure/database/PrismaClient";
import { PrismaContactMessageRepository } from "@infrastructure/database/repositories/PrismaContactMessageRepository";
import { SubmitContactMessage } from "@application/use-cases/contact/SubmitContactMessage";
import { EraseContactDataByEmail } from "@application/use-cases/contact/EraseContactDataByEmail";

class ContactContainer {
  private readonly contactMessageRepository: PrismaContactMessageRepository;

  constructor() {
    this.contactMessageRepository = new PrismaContactMessageRepository(prisma);
  }

  getSubmitContactMessageUseCase(): SubmitContactMessage {
    return new SubmitContactMessage(this.contactMessageRepository);
  }

  getEraseContactDataUseCase(): EraseContactDataByEmail {
    return new EraseContactDataByEmail(this.contactMessageRepository);
  }
}

const contactContainer = new ContactContainer();
export { contactContainer };
