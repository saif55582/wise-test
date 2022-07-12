import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as uuid from 'short-uuid';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { IQuestion, ITest } from 'src/types/test';
import { find } from 'lodash';
import { IStudent } from 'src/types/student';
import { throwError } from 'rxjs';

@Injectable()
export class TeacherService {
  private _questions: IQuestion[] = [];
  private _tests: ITest[] = [];

  constructor(private redisService: RedisCacheService) {}

  async listQuestion(category: string = null): Promise<IQuestion[]> {
    try {
      const questions: IQuestion[] | [] =
        (await this.redisService.get('questions')) || [];

      return questions;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async saveQuestion(dto: any): Promise<IQuestion> {
    try {
      const question: IQuestion = {
        id: uuid().generate(),
        ...dto,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const questions: IQuestion[] = await this.redisService.get('questions');

      let updatedQuestions: IQuestion[] = [question];

      if (questions) {
        updatedQuestions = [...questions, question];
      }

      //Saving to redis
      await this.redisService.set('questions', updatedQuestions);

      return question;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async fetchTest(): Promise<ITest[]> {
    try {
      const tests: ITest[] | [] = (await this.redisService.get('tests')) || [];

      return tests;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async saveTest(dto: ITest): Promise<ITest> {
    try {
      const test: ITest = {
        id: uuid().generate(),
        ...dto,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const tests: ITest[] = await this.redisService.get('tests');

      let updatedTests: ITest[] = [test];

      if (tests) {
        updatedTests = [...tests, test];
      }

      //Saving to redis
      await this.redisService.set('tests', updatedTests);

      return test;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async assignTest(testId: string, studentIds: string[]) {
    const tests: ITest[] = await this.redisService.get('tests');

    if (!tests) {
      throw new NotFoundException({
        message: 'Tests not found. Please create a test',
      });
    }

    if (tests) {
      // Find test with testId;
      const test = find(tests, function (obj) {
        return obj.id === testId;
      });

      if (!test) {
        throw new NotFoundException({
          message: 'Test not found with provided id',
        });
      }

      //assign tests to students
      const students: IStudent[] = await this.redisService.get('students');

      if (!students) {
        throw new NotFoundException({
          message: 'Students not found. Please add students',
        });
      }

      const updatedStudents = students.map((student: IStudent) => {
        if (studentIds.includes(student.id)) {
          let assigned_tests = student.assigned_tests;

          if (assigned_tests) {
            // If test already assigned skip
            if (!assigned_tests.includes(testId)) {
              assigned_tests = [...assigned_tests, testId];
            }
          } else {
            assigned_tests = [testId];
          }

          return {
            ...student,
            assigned_tests,
          };
        } else {
          return {
            ...student,
          };
        }
      });

      try {
        await this.redisService.set('students', updatedStudents);
      } catch (error) {
        console.error(error);
        throw new InternalServerErrorException(error);
      }

      console.log('updatedStudents->', updatedStudents);
    }
  }
}
