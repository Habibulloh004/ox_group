import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { RegisterCompanyDto } from './dto/company.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async registerCompany(registerCompanyDto: RegisterCompanyDto, userId: string) {
    const { token, subdomain } = registerCompanyDto;
    
    // Validate token with OX API
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://${subdomain}.ox-sys.com/profile`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': token,
          },
        })
      );
      
      if (!response.data) {
        throw new BadRequestException('Invalid token or subdomain');
      }
    } catch (error) {
      throw new BadRequestException('Invalid token or subdomain');
    }

    // Check if company exists
    const existingCompany = await this.prisma.company.findUnique({
      where: { subdomain },
    });

    if (existingCompany) {
      // Add user as manager to existing company
      await this.prisma.userCompany.create({
        data: {
          userId,
          companyId: existingCompany.id,
          role: 'MANAGER',
        },
      });
      
      return {
        message: 'Added as manager to existing company',
        company: existingCompany,
      };
    } else {
      // Create new company and make user admin
      const company = await this.prisma.company.create({
        data: {
          subdomain,
          token,
          adminId: userId,
        },
      });
      
      // Update user role to admin
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: 'ADMIN' },
      });
      
      // Add user to company as admin
      await this.prisma.userCompany.create({
        data: {
          userId,
          companyId: company.id,
          role: 'ADMIN',
        },
      });
      
      return {
        message: 'Company created successfully',
        company,
      };
    }
  }

  async deleteCompany(companyId: string, userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    if (company.adminId !== userId) {
      throw new ForbiddenException('Only the admin who created the company can delete it');
    }

    // Delete company and related records
    await this.prisma.userCompany.deleteMany({
      where: { companyId },
    });
    
    await this.prisma.company.delete({
      where: { id: companyId },
    });

    return {
      message: 'Company deleted successfully',
    };
  }
}
