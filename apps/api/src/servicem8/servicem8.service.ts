import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServiceM8Service {
  private readonly apiKey: string | undefined;
  private readonly baseUrl = 'https://api.servicem8.com/api_1.0';

  constructor(private readonly configService: ConfigService) {
    // Load API key from environment variable
    this.apiKey =
      this.configService
        .get<string>('SERVICEM8_API_KEY')
        ?.replace(/^["']|["']$/g, '') || undefined;

    if (!this.apiKey) {
      console.warn(
        'SERVICEM8_API_KEY not set. ServiceM8 features will not work.',
      );
    } else {
      console.log(
        'ServiceM8 API key loaded:',
        this.apiKey.substring(0, 10) + '...',
      );
    }
  }

  getApiKey(): string | undefined {
    return this.apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    if (!this.apiKey) {
      throw new HttpException(
        'ServiceM8 API key not configured. Please set SERVICEM8_API_KEY in .env',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'X-API-Key': this.apiKey,
      Accept: 'application/json',
      ...(options.method !== 'GET' && { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('ServiceM8 Request:', {
        url,
        method: options.method || 'GET',
        authType: 'X-API-Key',
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ServiceM8 API Error [${response.status}]:`, {
          url,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          headers: Object.fromEntries(response.headers.entries()),
        });

        throw new HttpException(
          `ServiceM8 API error: ${errorText || response.statusText}`,
          response.status,
        );
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return response.json();
      } else {
        // Return as text if not JSON
        return (await response.text()) as T;
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('ServiceM8 Request Error:', error);
      throw new HttpException(
        `Failed to connect to ServiceM8: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getBookings(
    customerEmail?: string,
    customerPhone?: string,
  ): Promise<any[]> {
    let endpoint = '/job.json';
    const params = new URLSearchParams();

    // Filter by customer if provided
    if (customerEmail || customerPhone) {
      try {
        // First, find the customer by email or phone
        const customers = await this.getCustomers(customerEmail, customerPhone);
        console.log(`Found ${customers.length} customers matching criteria`);

        if (customers.length > 0) {
          const customerUuid = customers[0].uuid;
          console.log(`Filtering jobs by company_uuid: ${customerUuid}`);
          // ServiceM8 uses company_uuid for filtering jobs by company/customer
          params.append('filter[]', `company_uuid = '${customerUuid}'`);
        } else {
          console.log('No customers found in ServiceM8, returning empty array');
          // If customer not found, return empty array
          // This ensures users only see their own bookings when they exist in ServiceM8
          return [];
        }
      } catch (error) {
        console.error('Error fetching customers for booking filter:', error);
        // If we can't find the customer, return empty array
        return [];
      }
    } else {
      // If no filter provided, fetch all bookings
      console.log('No customer filter provided, fetching all bookings');
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    console.log(`Calling ServiceM8 endpoint: ${endpoint}`);
    const bookings = await this.request<any[]>(endpoint);
    console.log(
      `ServiceM8 returned ${Array.isArray(bookings) ? bookings.length : 0} bookings`,
    );

    // Ensure we return an array
    return Array.isArray(bookings) ? bookings : [];
  }

  async getBookingById(bookingId: string): Promise<any> {
    return this.request<any>(`/job/${bookingId}.json`);
  }

  /**
   * Get job activity (booking) by UUID using filter
   */
  async getJobActivityByUuid(uuid: string): Promise<any | null> {
    try {
      const endpoint = `/jobactivity.json?%24filter=uuid%20eq%20'${uuid}'`;
      const activities = await this.request<any[]>(endpoint);
      return activities && activities.length > 0 ? activities[0] : null;
    } catch (error) {
      console.error('Error fetching job activity by UUID:', error);
      return null;
    }
  }

  /**
   * Get job by UUID using filter
   */
  async getJobByUuid(uuid: string): Promise<any | null> {
    try {
      const endpoint = `/job.json?%24filter=uuid%20eq%20'${uuid}'`;
      const jobs = await this.request<any[]>(endpoint);
      return jobs && jobs.length > 0 ? jobs[0] : null;
    } catch (error) {
      console.error('Error fetching job by UUID:', error);
      return null;
    }
  }

  /**
   * Get company by UUID using filter
   */
  async getCompanyByUuid(uuid: string): Promise<any | null> {
    try {
      const endpoint = `/company.json?%24filter=uuid%20eq%20'${uuid}'`;
      const companies = await this.request<any[]>(endpoint);
      return companies && companies.length > 0 ? companies[0] : null;
    } catch (error) {
      console.error('Error fetching company by UUID:', error);
      return null;
    }
  }

  /**
   * Get attachments by related object UUID
   */
  async getAttachmentsByRelatedObject(
    relatedObjectUuid: string,
  ): Promise<any[]> {
    try {
      const endpoint = `/attachment.json?%24filter=related_object_uuid%20eq%20'${relatedObjectUuid}'`;
      const attachments = await this.request<any[]>(endpoint);
      return Array.isArray(attachments) ? attachments : [];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  }

  /**
   * Get job activities (scheduled times/bookings)
   * Note: jobactivity.json is used for bookings/scheduled times
   */
  async getJobActivities(companyUuid?: string): Promise<any[]> {
    let endpoint = '/jobactivity.json';
    const params = new URLSearchParams();

    if (companyUuid) {
      params.append('filter[]', `company_uuid = '${companyUuid}'`);
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.request<any[]>(endpoint);
  }

  /**
   * Get jobs (work orders)
   * Note: job.json is used for jobs/work orders
   */
  async getJobs(companyUuid?: string): Promise<any[]> {
    let endpoint = '/job.json';
    const params = new URLSearchParams();

    if (companyUuid) {
      params.append('filter[]', `company_uuid = '${companyUuid}'`);
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.request<any[]>(endpoint);
  }

  async getCustomers(email?: string, phone?: string): Promise<any[]> {
    let endpoint = '/company.json';
    const params = new URLSearchParams();

    if (email) {
      params.append('filter[]', `email = '${email}'`);
    }
    if (phone) {
      // Normalize phone number for matching
      const normalizedPhone = phone.replace(/\D/g, '');
      params.append(
        'filter[]',
        `mobile = '${normalizedPhone}' OR phone = '${normalizedPhone}'`,
      );
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.request<any[]>(endpoint);
  }

  async getBookingAttachments(bookingId: string): Promise<any[]> {
    try {
      const endpoint = `/attachment.json?%24filter=related_object_uuid%20eq%20'${bookingId}'`;
      const attachments = await this.request<any[]>(endpoint);

      if (!attachments) return [];
      if (Array.isArray(attachments)) return attachments;

      return [attachments];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  }
  async getAttachmentUrl(
    bookingId: string,
    attachmentId: string,
  ): Promise<string> {
    // ServiceM8 typically requires downloading attachments through their API
    // This returns the API endpoint for the attachment
    return `${this.baseUrl}/job/${bookingId}/photo/${attachmentId}.json`;
  }

  /**
   * Get complete booking details with related data
   * Tries to find booking as job activity first, then as job
   */
  async getBookingDetails(bookingId: string): Promise<any> {
    try {
      // First, try to get it as a job activity (booking)
      let booking: any = await this.getJobActivityByUuid(bookingId);
      let isJobActivity = true;

      // If not found as job activity, try as a job
      if (!booking) {
        booking = await this.getJobByUuid(bookingId);
        isJobActivity = false;
      }

      // If still not found, return null
      if (!booking) {
        console.log(`Booking not found for ID: ${bookingId}`);
        return null;
      }

      console.log(`Found booking as ${isJobActivity ? 'JobActivity' : 'Job'}`);
      console.log('Booking data:', JSON.stringify(booking, null, 2));

      // Get related job if this is a job activity
      let job: any = null;
      if (isJobActivity && booking.job_uuid) {
        job = await this.getJobByUuid(booking.job_uuid);
        console.log('Related job:', JSON.stringify(job, null, 2));
      } else if (!isJobActivity) {
        job = booking; // If it's already a job, use it
      }

      // Get customer/company
      let customer: any = null;
      const companyUuid = job?.company_uuid || booking.company_uuid;
      if (companyUuid) {
        customer = await this.getCompanyByUuid(companyUuid);
        console.log('Customer:', JSON.stringify(customer, null, 2));
      }

      const jobUuid = job?.uuid || booking.job_uuid;
      let attachments: any[] = [];

      if (jobUuid) {
        attachments = await this.getAttachmentsByRelatedObject(jobUuid);
        console.log(`Found ${attachments.length} attachments`);
      }

      return {
        booking: booking,
        job: job,
        customer: customer,
        attachments: attachments,
        type: isJobActivity ? 'jobactivity' : 'job',
        summary: {
          booking_id: booking.uuid,
          job_id: job?.uuid,
          job_number: job?.generated_job_id || job?.job_number || 'N/A',
          customer_name: customer?.name || 'Unknown',
          customer_email: customer?.email || null,
          customer_phone: customer?.mobile || customer?.phone || null,
          start_time: booking.start_dts || booking.scheduled_start,
          end_time: booking.end_dts || booking.scheduled_end,
          status: job?.status || booking.status || 'Unknown',
          description: job?.job_description || booking.notes,
          attachment_count: attachments.length,
        },
      };
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  }
}
