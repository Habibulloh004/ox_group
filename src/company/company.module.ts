import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

@Module({
  imports: [HttpModule],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
