import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';

describe('StudentService', () => {
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentService],
    }).compile();

    service = module.get<any>(StudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
