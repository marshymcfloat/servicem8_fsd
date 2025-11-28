import {
  Controller,
  Get,
  Param,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ServiceM8Service } from '../servicem8/servicem8.service';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly serviceM8: ServiceM8Service) {}

  @Get(':bookingId/:attachmentId/metadata')
  async getAttachmentMetadata(
    @Param('bookingId') bookingId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    try {
      const apiKey = this.serviceM8.getApiKey();

      if (!apiKey) {
        throw new HttpException(
          'ServiceM8 API key not configured. Please set SERVICEM8_API_KEY in .env',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const attachmentMetadataUrl = `https://api.servicem8.com/api_1.0/attachment.json?%24filter=uuid%20eq%20'${attachmentId}'`;

      const response = await fetch(attachmentMetadataUrl, {
        headers: {
          'X-API-Key': apiKey,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new HttpException(
          `Failed to fetch attachment metadata: ${response.statusText}`,
          response.status,
        );
      }

      const attachments = await response.json();
      const attachment =
        Array.isArray(attachments) && attachments.length > 0
          ? attachments[0]
          : null;

      if (!attachment) {
        throw new HttpException('Attachment not found', HttpStatus.NOT_FOUND);
      }

      return {
        id: attachment.uuid,
        filename: attachment.file_name || attachment.filename || 'attachment',
        fileUrl: attachment.file_url,
        relatedObjectUuid: attachment.related_object_uuid,
        createdAt: attachment.edit_date || attachment.created,
        fileSize: attachment.file_size,
        contentType: attachment.content_type,
        downloadUrl: `/attachments/${bookingId}/${attachmentId}`,
        metadata: attachment,
      };
    } catch (error) {
      console.error('Error fetching attachment metadata:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to fetch attachment metadata',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':bookingId/:attachmentId')
  async getAttachment(
    @Param('bookingId') bookingId: string,
    @Param('attachmentId') attachmentId: string,
    @Res() res: Response,
  ) {
    try {
      const apiKey = this.serviceM8.getApiKey();

      if (!apiKey) {
        throw new HttpException(
          'ServiceM8 API key not configured. Please set SERVICEM8_API_KEY in .env',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const attachmentMetadataUrl = `https://api.servicem8.com/api_1.0/attachment.json?%24filter=uuid%20eq%20'${attachmentId}'`;

      let attachmentUrl: string;
      let response = await fetch(attachmentMetadataUrl, {
        headers: {
          'X-API-Key': apiKey,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const attachments = await response.json();
        const attachment =
          Array.isArray(attachments) && attachments.length > 0
            ? attachments[0]
            : null;

        if (attachment && attachment.file_url) {
          attachmentUrl = attachment.file_url;
          console.log(`Found attachment file_url: ${attachmentUrl}`);
        } else {
          attachmentUrl = `https://api.servicem8.com/api_1.0/attachment/${attachmentId}`;
          console.log(`Using fallback attachment URL: ${attachmentUrl}`);
        }
      } else {
        attachmentUrl = `https://api.servicem8.com/api_1.0/job/${bookingId}/photo/${attachmentId}`;
        console.log(`Using job photo URL: ${attachmentUrl}`);
      }

      response = await fetch(attachmentUrl, {
        headers: {
          'X-API-Key': apiKey,
          Accept: '*/*',
        },
      });

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => response.statusText);
        console.error(`Failed to fetch attachment from ${attachmentUrl}:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new HttpException(
          `Failed to fetch attachment: ${response.statusText}`,
          response.status,
        );
      }

      const contentType =
        response.headers.get('content-type') || 'application/octet-stream';
      const contentDisposition = response.headers.get('content-disposition');

      res.setHeader('Content-Type', contentType);
      if (contentDisposition) {
        res.setHeader('Content-Disposition', contentDisposition);
      } else {
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${attachmentId}"`,
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new HttpException(
          'No response body',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }

      res.end();
    } catch (error) {
      console.error('Error fetching attachment:', error);
      throw new HttpException(
        error.message || 'Failed to fetch attachment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
