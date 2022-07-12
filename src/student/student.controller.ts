import { Controller, Get, HttpException, Post, Req } from '@nestjs/common';
import { IResponse } from '../types/system';
import { Request } from 'express';
import { StudentService } from './student.service';
import { IAnswerBook, TTestAction } from 'src/types/test';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('/')
  async getStudents(@Req() req: Request): Promise<IResponse> {
    const students = await this.studentService.fetchStudents();

    return {
      success: true,
      appCode: 200,
      message: 'ok',
      data: {
        students,
      },
    };
  }

  @Post('/')
  async createStudents(@Req() req: Request): Promise<IResponse> {
    const body = req.body;

    const student = await this.studentService.saveStudent(body);

    return {
      success: true,
      appCode: 200,
      message: 'ok',
      data: {
        student,
      },
    };
  }

  @Get(':studentId/tests')
  async getAssignedTests(@Req() req: Request): Promise<IResponse> {
    const studentId = req.params.studentId;

    try {
      const tests = await this.studentService.getAssignedTests(studentId);

      return {
        success: true,
        appCode: 200,
        message: 'ok',
        data: {
          tests,
        },
      };
    } catch (error) {
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

  @Post(':studentId/tests/action')
  async testAction(@Req() req: Request): Promise<IResponse> {
    const studentId = req.params.studentId;
    const testId = req.body.testId;
    const action: TTestAction = req.body.action;
    const answerBook: IAnswerBook = req.body.answer_book;

    try {
      await this.studentService.testAction(
        studentId,
        testId,
        action,
        answerBook,
      );

      return {
        success: true,
        appCode: 200,
        message: 'ok',
      };
    } catch (error) {
      console.error(error);
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
