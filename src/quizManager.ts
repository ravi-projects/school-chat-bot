import { Question, QuizState, QuizResult, Subject } from './types';

export class QuizManager {
  private currentSubject: Subject | null = null;
  private quizState: QuizState = {
    currentQuestionIndex: 0,
    answers: [],
    isCompleted: false,
    score: 0
  };

  public startQuiz(subject: Subject): void {
    this.currentSubject = subject;
    this.quizState = {
      currentQuestionIndex: 0,
      answers: new Array(subject.questions.length).fill(null),
      isCompleted: false,
      score: 0
    };
    
    // Load saved progress if exists
    this.loadProgress();
  }

  public getCurrentQuestion(): Question | null {
    if (!this.currentSubject || this.quizState.currentQuestionIndex >= this.currentSubject.questions.length) {
      return null;
    }
    return this.currentSubject.questions[this.quizState.currentQuestionIndex];
  }

  public answerQuestion(answer: 'A' | 'B' | 'C' | 'D'): void {
    if (!this.currentSubject) return;
    
    this.quizState.answers[this.quizState.currentQuestionIndex] = answer;
    this.saveProgress();
  }

  public nextQuestion(): boolean {
    if (!this.currentSubject) return false;
    
    if (this.quizState.currentQuestionIndex < this.currentSubject.questions.length - 1) {
      this.quizState.currentQuestionIndex++;
      this.saveProgress();
      return true;
    }
    return false;
  }

  public previousQuestion(): boolean {
    if (this.quizState.currentQuestionIndex > 0) {
      this.quizState.currentQuestionIndex--;
      this.saveProgress();
      return true;
    }
    return false;
  }

  public canGoNext(): boolean {
    return this.currentSubject !== null && 
           this.quizState.currentQuestionIndex < this.currentSubject.questions.length - 1;
  }

  public canGoPrevious(): boolean {
    return this.quizState.currentQuestionIndex > 0;
  }

  public getCurrentAnswer(): string | null {
    return this.quizState.answers[this.quizState.currentQuestionIndex];
  }

  public getProgress(): { current: number; total: number; percentage: number } {
    const total = this.currentSubject?.questions.length || 0;
    const current = this.quizState.currentQuestionIndex + 1;
    const percentage = total > 0 ? (current / total) * 100 : 0;
    
    return { current, total, percentage };
  }

  public isQuizComplete(): boolean {
    if (!this.currentSubject) return false;
    
    return this.quizState.answers.every(answer => answer !== null);
  }

  public finishQuiz(): QuizResult[] {
    if (!this.currentSubject) return [];
    
    const results: QuizResult[] = [];
    let correctCount = 0;

    this.currentSubject.questions.forEach((question, index) => {
      const userAnswer = this.quizState.answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) correctCount++;
      
      results.push({
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        options: {
          A: question.optionA,
          B: question.optionB,
          C: question.optionC,
          D: question.optionD
        }
      });
    });

    this.quizState.score = correctCount;
    this.quizState.isCompleted = true;
    this.saveProgress();
    
    return results;
  }

  public getQuizState(): QuizState {
    return { ...this.quizState };
  }

  public getCurrentSubject(): Subject | null {
    return this.currentSubject;
  }

  public resetQuiz(): void {
    if (!this.currentSubject) return;
    
    this.quizState = {
      currentQuestionIndex: 0,
      answers: new Array(this.currentSubject.questions.length).fill(null),
      isCompleted: false,
      score: 0
    };
    
    this.clearProgress();
  }

  private saveProgress(): void {
    if (!this.currentSubject) return;
    
    const progressKey = `quiz_progress_${this.currentSubject.name}`;
    localStorage.setItem(progressKey, JSON.stringify(this.quizState));
  }

  private loadProgress(): void {
    if (!this.currentSubject) return;
    
    const progressKey = `quiz_progress_${this.currentSubject.name}`;
    const saved = localStorage.getItem(progressKey);
    
    if (saved) {
      try {
        const savedState = JSON.parse(saved);
        // Only load if not completed
        if (!savedState.isCompleted) {
          this.quizState = savedState;
        }
      } catch (error) {
        console.warn('Failed to load saved progress:', error);
      }
    }
  }

  private clearProgress(): void {
    if (!this.currentSubject) return;
    
    const progressKey = `quiz_progress_${this.currentSubject.name}`;
    localStorage.removeItem(progressKey);
  }
}