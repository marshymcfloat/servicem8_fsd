import { Module } from '@nestjs/common';
import { ServiceM8Service } from './servicem8.service';

@Module({
  providers: [ServiceM8Service],
  exports: [ServiceM8Service],
})
export class ServiceM8Module {}

