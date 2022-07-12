import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentController } from './student/student.controller';
import { StudentService } from './student/student.service';
import { TeacherController } from './teacher/teacher.controller';
import { TeacherService } from './teacher/teacher.service';
import { RedisCacheModule } from './redis-cache/redis-cache.module';

@Module({
  imports: [RedisCacheModule],
  controllers: [AppController, StudentController, TeacherController],
  providers: [AppService, StudentService, TeacherService],
})
export class AppModule {}
