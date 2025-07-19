export interface Question {
  subject: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: (string | null)[];
  isCompleted: boolean;
  score: number;
}

export interface Subject {
  name: string;
  icon: string;
  filename: string;
  questions: Question[];
}

export interface QuizResult {
  question: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}