import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { ServiceM8Module } from '../servicem8/servicem8.module';

@Module({
  imports: [ServiceM8Module],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}

