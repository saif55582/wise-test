import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { IResponse } from '../types/system';
import { Request } from 'express';
import { TeacherService } from './teacher.service';
import { IQuestion } from 'src/types/test';

/**
 * Admin Scope
 */
@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  /**
   *
   * Createa test
   */
  @Post('/tests')
  async createTest(@Req() req: Request): Promise<IResponse> {
    const body = req.body;

    const test = await this.teacherService.saveTest(body);

    return {
      success: true,
      appCode: 200,
      message: 'ok',
      data: {
        test,
      },
    };
  }

  /**
   *
   * Get list of questions
   */
  @Get('/tests')
  async listTest(@Req() req: Request): Promise<IResponse> {
    const tests = await this.teacherService.fetchTest();

    return {
      success: true,
      appCode: 200,
      message: 'ok',
      data: {
        tests,
      },
    };
  }

  /**
   * Create a question
   */
  @Post('/questions')
  async createQuestion(@Req() req: Request): Promise<IResponse> {
    const body: IQuestion = req.body;
    const question = await this.teacherService.saveQuestion(body);

    return {
      success: true,
      appCode: 200,
      message: 'ok',
      data: {
        question,
      },
    };
  }

  /**
   * Get list of questions
   */
  @Get('/questions')
  async listQuestions(@Req() req: Request): Promise<IResponse> {
    const questions = await this.teacherService.listQuestion();

    return {
      success: true,
      appCode: 200,
      message: 'ok',
      data: {
        questions,
      },
    };
  }

  @Post('/tests/assign')
  async assignTest(@Req() req: Request): Promise<IResponse> {
    const testId: string = req.body.testId;
    const studentIds: string[] = req.body.studentIds;

    try {
      await this.teacherService.assignTest(testId, studentIds);

      return {
        success: true,
        appCode: 200,
        message: 'ok',
      };
    } catch (error) {
      console.error('TeacherController->assignTest->', error);

      throw new HttpException(
        {
          success: false,
          appCode: error.status,
          message: error.message,
        },
        error.status,
      );
    }
  }
}
