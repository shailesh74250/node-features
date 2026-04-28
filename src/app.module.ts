import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { DateTimeModule } from './modules/date-time/date-time.module';

@Module({
  imports: [DatabaseModule, DateTimeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
