import { prisma } from "@infrastructure/database/PrismaClient";
import { PrismaContactMessageRepository } from "@infrastructure/database/repositories/PrismaContactMessageRepository";
import { SubmitContactMessage } from "@application/use-cases/contact/SubmitContactMessage";

class ContactContainer {
  private readonly contactMessageRepository: PrismaContactMessageRepository;

  constructor() {
    this.contactMessageRepository = new PrismaContactMessageRepository(prisma);
  }

  getSubmitContactMessageUseCase(): SubmitContactMessage {
    return new SubmitContactMessage(this.contactMessageRepository);
  }
}

const contactContainer = new ContactContainer();
export { contactContainer };
