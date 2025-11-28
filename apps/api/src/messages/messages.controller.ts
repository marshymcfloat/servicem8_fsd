import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMessage(
    @Body() body: { bookingId: string; userId: string; content: string },
  ) {
    return this.messagesService.createMessage(
      body.bookingId,
      body.userId,
      body.content,
    );
  }

  @Get('booking/:bookingId')
  async getMessagesByBooking(@Param('bookingId') bookingId: string) {
    return this.messagesService.getMessagesByBooking(bookingId);
  }

  @Get('user/:userId')
  async getMessagesByUser(@Param('userId') userId: string) {
    return this.messagesService.getMessagesByUser(userId);
  }
}

