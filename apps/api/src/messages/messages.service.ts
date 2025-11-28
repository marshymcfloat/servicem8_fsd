import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import path from 'path';

export interface Message {
  id: string;
  bookingId: string;
  userId: string;
  content: string;
  createdAt: string;
}

const MESSAGES_FILE = path.join(process.cwd(), 'data/messages.json');

@Injectable()
export class MessagesService {
  private async readMessages(): Promise<Message[]> {
    try {
      const data = await fs.readFile(MESSAGES_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private async writeMessages(messages: Message[]): Promise<void> {
    await fs.mkdir(path.dirname(MESSAGES_FILE), { recursive: true });
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  }

  async createMessage(
    bookingId: string,
    userId: string,
    content: string,
  ): Promise<Message> {
    const messages = await this.readMessages();
    
    const newMessage: Message = {
      id: crypto.randomUUID(),
      bookingId,
      userId,
      content,
      createdAt: new Date().toISOString(),
    };

    messages.push(newMessage);
    await this.writeMessages(messages);

    return newMessage;
  }

  async getMessagesByBooking(bookingId: string): Promise<Message[]> {
    const messages = await this.readMessages();
    return messages.filter((msg) => msg.bookingId === bookingId);
  }

  async getMessagesByUser(userId: string): Promise<Message[]> {
    const messages = await this.readMessages();
    return messages.filter((msg) => msg.userId === userId);
  }
}

