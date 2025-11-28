import { Injectable } from '@nestjs/common';
import { ServiceM8Service } from '../servicem8/servicem8.service';

@Injectable()
export class BookingsService {
  constructor(private readonly serviceM8: ServiceM8Service) {}

  async getBookingsByCustomer(email?: string, phone?: string) {
    try {
      console.log('Fetching bookings from ServiceM8 for:', { email, phone });
      const bookings = await this.serviceM8.getBookings(email, phone);
      console.log(`Retrieved ${bookings.length} bookings from ServiceM8`);

      if (!bookings || bookings.length === 0) {
        console.log('No bookings found in ServiceM8');
        return [];
      }

      return bookings.map((booking) => ({
        id: booking.uuid,
        jobNumber: booking.job_number || booking.job_number || 'N/A',
        title: booking.job_description || booking.description || 'No title',
        status: booking.job_status || booking.status || 'Unknown',
        scheduledStart: booking.scheduled_start || booking.scheduledStart,
        scheduledEnd: booking.scheduled_end || booking.scheduledEnd,
        address: booking.address_street || booking.address,
        city: booking.address_city || booking.city,
        state: booking.address_state || booking.state,
        createdAt:
          booking.created || booking.created_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching bookings from ServiceM8:', error);
      throw error;
    }
  }

  async getBookingById(bookingId: string) {
    try {
      const bookingDetails = await this.serviceM8.getBookingDetails(bookingId);

      if (!bookingDetails) {
        return null;
      }

      const { booking, job, customer, attachments, type } = bookingDetails;

      console.log('Processing booking details:', {
        hasBooking: !!booking,
        hasJob: !!job,
        hasCustomer: !!customer,
        attachmentCount: attachments?.length || 0,
      });

      const mappedAttachments = (attachments || []).map((attachment: any) => ({
        id: attachment.uuid,
        filename: attachment.file_name || attachment.filename || 'attachment',
        url: `/attachments/${job?.uuid || bookingId}/${attachment.uuid}`,
        createdAt: attachment.edit_date || attachment.created,
      }));

      return {
        booking: {
          id: booking.uuid,
          type: type,
          startTime: booking.start_dts || booking.scheduled_start,
          endTime: booking.end_dts || booking.scheduled_end,
          notes: booking.notes,
          status: booking.status,
          jobNumber: job?.generated_job_id || job?.job_number || 'N/A',
          jobStatus: job?.status || booking.status || 'Unknown',
          description:
            job?.job_description || booking.notes || 'No description',
        },
        job: job
          ? {
              uuid: job.uuid,
              jobNumber: job.generated_job_id || job.job_number,
              status: job.status,
              description: job.job_description,
              addressStreet: job.job_address,
              addressCity: job.billing_address_city,
              addressState: job.billing_address_state,
              scheduledStart: job.scheduled_start,
              scheduledEnd: job.scheduled_end,
            }
          : null,
        customer: customer
          ? {
              uuid: customer.uuid,
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              mobile: customer.mobile,
              address: customer.address,
            }
          : null,
        attachments: mappedAttachments,
        summary: {
          bookingId: booking.uuid,
          jobId: job?.uuid,
          jobNumber: job?.generated_job_id || job?.job_number || 'N/A',
          status: job?.status || booking.status || 'Unknown',
          customerName: customer?.name || 'Unknown',
          startTime: booking.start_dts || booking.scheduled_start,
          endTime: booking.end_dts || booking.scheduled_end,
          attachmentCount: mappedAttachments.length,
        },
      };
    } catch (error) {
      console.error('Error fetching booking details from ServiceM8:', error);
      throw error;
    }
  }

  async getBookingAttachments(bookingId: string) {
    try {
      const attachments = await this.serviceM8.getBookingAttachments(bookingId);
      return attachments.map((attachment) => ({
        id: attachment.uuid,
        filename: attachment.filename || 'attachment',
        url: `/api/attachments/${bookingId}/${attachment.uuid}`,
        createdAt: attachment.created,
      }));
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  }
}
