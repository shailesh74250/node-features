import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ProductSearchController } from './product-search.controller';
import { ProductSearchService } from './product-search.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductSearchController],
  providers: [ProductSearchService],
  exports: [ProductSearchService],
})
export class ProductSearchModule {}
