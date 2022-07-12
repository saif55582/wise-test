import { Module } from '@nestjs/common';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';

@Module({
  imports: [RedisCacheModule],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
