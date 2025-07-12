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
      // Company exists - add user as MANAGER (not admin)
      
      // Check if user is already associated with this company
      const existingUserCompany = await this.prisma.userCompany.findUnique({
        where: {
          userId_companyId: {
            userId,
            companyId: existingCompany.id,
          },
        },
      });

      if (existingUserCompany) {
        return {
          message: 'User is already a member of this company',
          company: existingCompany,
        };
      }

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
      // Company doesn't exist - create it and assign user as ADMIN
      
      // Update user role to ADMIN
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: 'ADMIN' },
      });
      
      // Create new company
      const company = await this.prisma.company.create({
        data: {
          subdomain,
          token,
          adminId: userId,
        },
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