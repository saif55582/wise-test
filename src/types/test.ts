export interface ITest {
  id?: string;
  name: string;
  start_time: number;
  duration_mins: number;
  no_of_ques: number;
  questions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface IAnswers {
  choices: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correct_choices?: {
    a: boolean;
    b: boolean;
    c: boolean;
    d: boolean;
  };
}

export type TCategory = 'linux' | 'devops' | 'cloud';

export type TTestAction = 'start' | 'end';

export interface IQuestion {
  id?: string;
  category: TCategory;
  question: string;
  description?: string;
  explanation?: string;
  resources?: string[];
  multiple_correct_answers: boolean;
  answers: IAnswers;
  created_at?: string;
  updated_at?: string;
}

export interface IAnswerBook {
  [key: string]: {
    //key is questionId
    a: boolean;
    b: boolean;
    c: boolean;
    d: boolean;
  };
}

export interface IAttemptedTests {
  [key: string]: IAnswerBook; //key is testId
}
