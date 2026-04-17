import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductSearchModule } from './modules/product-search/product-search.module';

@Module({
  imports: [ProductSearchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
