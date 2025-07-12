import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async getProducts(userId: string, page: number = 1, size: number = 10) {
    // Check size limit
    if (size > 20) {
      throw new BadRequestException('Size cannot exceed 20');
    }

    // Get user's companies
    const userCompanies = await this.prisma.userCompany.findMany({
      where: { userId },
      include: {
        company: true,
      },
    });

    if (userCompanies.length === 0) {
      throw new ForbiddenException('User is not associated with any company');
    }

    // Use the first company (or you could let user specify which company)
    const company = userCompanies[0].company;

    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://${company.subdomain}.ox-sys.com/variations`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': company.token,
          },
          params: {
            page,
            size,
          },
        })
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to fetch products from OX API');
    }
  }
}