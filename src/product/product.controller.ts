import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ManagerOnly } from '../auth/decorators/auth.decorator';
import { GetProductsDto } from './dto/product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ManagerOnly()
  async getProducts(@Query() query: GetProductsDto, @Request() req) {
    return this.productService.getProducts(req.user.id, query.page, query.size);
  }
}
