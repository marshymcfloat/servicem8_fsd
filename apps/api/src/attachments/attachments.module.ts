import { Module } from '@nestjs/common';
import { AttachmentsController } from './attachments.controller';
import { ServiceM8Module } from '../servicem8/servicem8.module';

@Module({
  imports: [ServiceM8Module],
  controllers: [AttachmentsController],
})
export class AttachmentsModule {}

