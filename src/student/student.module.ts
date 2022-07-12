import { Module } from '@nestjs/common';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';

@Module({
  imports: [RedisCacheModule],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
