import bcrypt from "bcrypt";
import type { IPasswordService } from "../../application/interfaces/IPasswordService.js";

export class PasswordService implements IPasswordService {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
