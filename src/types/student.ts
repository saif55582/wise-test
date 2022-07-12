import { IAnswerBook, IAttemptedTests } from './test';

export interface IStudent {
  id?: string;
  name: string;
  assigned_tests?: string[];
  attempted_tests?: IAttemptedTests;
  ongoing_test?: string;
}

// const s: IStudent = {
//   attempted_tests: {
//     testId: {
//       questionId1: {
//         a: true,
//         b: false,
//         c: false,
//         d: false,
//       },
//       questionId2: {
//         a: true,
//         b: false,
//         c: false,
//         d: false,
//       },
//     },
//   },
// };
