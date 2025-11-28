import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { AuthRegisterTypes } from '@repo/validators';

export interface User {
  id: string;
  email: string;
  username: string;
  phone_numer: string;
  password: string;
  createdAt: string;
}

const USERS_FILE = path.join(process.cwd(), 'data/users.json');

@Injectable()
export class UserService {
  private async readUsers(): Promise<User[]> {
    try {
      const data = await fs.readFile(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private async writeUsers(users: User[]): Promise<void> {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  }

  async getUserByEmail(email: string): Promise<Omit<User, 'password'> | null> {
    const users = await this.readUsers();
    const user = users.find((user) => user.email === email);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const users = await this.readUsers();
    const user = users.find((user) => user.id === id);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserWithPasswordByEmail(email: string): Promise<User | null> {
    const users = await this.readUsers();
    return users.find((user) => user.email === email) || null;
  }

  async getUserWithPasswordByPhone(phone: string): Promise<User | null> {
    const users = await this.readUsers();
    return users.find((user) => user.phone_numer === phone) || null;
  }

  async getUserByPhone(phone: string): Promise<Omit<User, 'password'> | null> {
    const users = await this.readUsers();
    const user = users.find((user) => user.phone_numer === phone);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async verifyUserCredentialsByPhone(
    phone: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.getUserWithPasswordByPhone(phone);
    if (!user) return null;

    const isValid = await this.verifyPassword(password, user.password);
    if (!isValid) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createUser(
    data: Omit<AuthRegisterTypes, 'confirm_password'>,
  ): Promise<Omit<User, 'password'>> {
    const users = await this.readUsers();

    if (users.some((user) => user.email === data.email)) {
      throw new ConflictException('User with this email already exists');
    }

    if (users.some((user) => user.username === data.username)) {
      throw new ConflictException('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser: User = {
      id: crypto.randomUUID(),
      email: data.email,
      username: data.username,
      phone_numer: data.phone_numer,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await this.writeUsers(users);

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async verifyUserCredentials(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.getUserWithPasswordByEmail(email);
    if (!user) return null;

    const isValid = await this.verifyPassword(password, user.password);
    if (!isValid) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
