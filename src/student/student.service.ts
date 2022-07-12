import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { IAnswerBook, IQuestion, ITest, TTestAction } from 'src/types/test';
import * as uuid from 'short-uuid';
import { IStudent } from 'src/types/student';
import { find } from 'lodash';

@Injectable()
export class StudentService {
  private _assignedTest: ITest[] = [];
  private _ongoingTest: ITest = null;

  constructor(private readonly redisService: RedisCacheService) {}

  async fetchStudents(): Promise<IStudent[]> {
    try {
      const students: IStudent[] =
        (await this.redisService.get('students')) || [];

      return students;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async saveStudent(dto: any) {
    try {
      const student: IStudent = {
        id: uuid().generate(),
        ...dto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const students: IStudent[] = await this.redisService.get('students');

      let updatedStudents: IStudent[] = [student];

      if (students) {
        updatedStudents = [...students, student];
      }

      //Saving to redis
      await this.redisService.set('students', updatedStudents);

      return student;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getAssignedTests(studentId: string): Promise<any> {
    try {
      const students = await this.redisService.get('students');

      if (!students) {
        throw new NotFoundException({
          message: 'Students not found. Please add students',
        });
      }

      const student: IStudent = find(students, (student: IStudent) => {
        return student.id === studentId;
      });

      if (!student) {
        throw new NotFoundException({
          message: 'Student not found with provided id',
        });
      }

      const assigned_tests = student.assigned_tests;

      if (!assigned_tests || assigned_tests.length === 0) {
        return [];
      }

      //Getting test from DB
      const tests: ITest[] = await this.redisService.get('tests');

      if (!tests) {
        throw new NotFoundException({
          message: 'Tests not found',
        });
      }

      const filteredTests: ITest[] = tests.filter((test: ITest) => {
        return assigned_tests.includes(test.id);
      });

      return filteredTests;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async testAction(
    studentId: string,
    testId: string,
    action: TTestAction,
    answerBook?: IAnswerBook,
  ): Promise<any> {
    //Getting test from DB redis
    const tests: ITest[] = await this.redisService.get('tests');

    if (!tests) {
      throw new NotFoundException({
        message: 'Tests not found',
      });
    }

    const test = find(tests, (test: ITest) => {
      return test.id === testId;
    });

    if (!test) {
      throw new NotFoundException({
        message: 'Test not found for provided testId',
      });
    }

    // Getting students from DB redis
    const students = await this.redisService.get('students');

    if (!students) {
      throw new NotFoundException({
        message: 'Students not found. Please add students',
      });
    }

    const student: IStudent = find(students, (student: IStudent) => {
      return student.id === studentId;
    });

    if (!student) {
      throw new NotFoundException({
        message: 'Student not found with provided id',
      });
    }

    if (action === 'start') {
      // Checking if a test is allowed to start
      const now = new Date().getTime();

      if (now >= test.start_time) {
        student.ongoing_test = testId;
      } else {
        throw new NotAcceptableException({
          message: 'Test cannot be started now.',
        });
      }

      // Check if a test is assigned
      if (!student.assigned_tests.includes(testId)) {
        throw new NotFoundException({
          message: 'Test not assigned.',
        });
      }

      const updatedStudents = students.map((student: IStudent) => {
        if (student.id === studentId) {
          return {
            ...student,
            ongoing_test: testId,
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

      //Getting questions form DB
      const questions = await this.redisService.get('questions');

      if (!questions) {
        throw new NotFoundException({
          message: 'Questions not found. Please add questions',
        });
      }

      let questionsObj = test.questions.map((questionId: string) => {
        const question: IQuestion = find(questions, (question: IQuestion) => {
          return question.id === questionId;
        });

        return question;
      });

      // Trimming out correct answers
      questionsObj = questionsObj.map((question: IQuestion) => {
        return {
          ...question,
          answers: {
            ...question.answers,
            correct_choices: undefined,
          },
        };
      });

      return {
        ...test,
        questions: questionsObj,
      };
    } else if (action === 'end') {
      const updatedStudents: IStudent[] = students.map((student: IStudent) => {
        if (student.id === studentId) {
          const attempted_tests = student.attempted_tests || {};

          if (answerBook) {
            attempted_tests[testId] = answerBook;
          }

          return {
            ...student,
            attempted_tests,
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
    }
  }
}
