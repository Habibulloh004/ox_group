import { Body, Controller, Delete, Param, Post, UseGuards, Request } from '@nestjs/common';
import { CompanyService } from './company.service';
import { RegisterCompanyDto } from './dto/company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminOnly } from '../auth/decorators/auth.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('register-company')
  async registerCompany(@Body() registerCompanyDto: RegisterCompanyDto, @Request() req) {
    return this.companyService.registerCompany(registerCompanyDto, req.user.id);
  }

  @Delete('company/:id')
  @AdminOnly()
  async deleteCompany(@Param('id') id: string, @Request() req) {
    return this.companyService.deleteCompany(id, req.user.id);
  }
}