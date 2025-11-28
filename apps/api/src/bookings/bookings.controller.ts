import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async getBookings(
    @Query('email') email?: string,
    @Query('phone') phone?: string,
  ) {
    return this.bookingsService.getBookingsByCustomer(email, phone);
  }

  @Get(':id')
  async getBookingById(@Param('id') id: string) {
    try {
      const bookingDetails = await this.bookingsService.getBookingById(id);

      if (!bookingDetails) {
        throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
      }

      return bookingDetails;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching booking',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/attachments')
  async getBookingAttachments(@Param('id') id: string) {
    return this.bookingsService.getBookingAttachments(id);
  }
}

