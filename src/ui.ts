import { CSVParser } from './csvParser';
import { QuizManager } from './quizManager';
import { Subject, QuizResult } from './types';

export class UIManager {
  private csvParser: CSVParser;
  private quizManager: QuizManager;
  private currentView: 'welcome' | 'quiz' | 'results' = 'welcome';

  constructor() {
    this.csvParser = CSVParser.getInstance();
    this.quizManager = new QuizManager();
    this.initializeEventListeners();
  }

  public async initialize(): Promise<void> {
    await this.loadSubjects();
    this.showWelcomeScreen();
  }

  private async loadSubjects(): Promise<void> {
    try {
      const subjects = await this.csvParser.loadSubjects();
      this.renderSubjectList(subjects);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      this.showError('Failed to load quiz subjects. Please check your CSV files.');
    }
  }

  private renderSubjectList(subjects: Subject[]): void {
    const subjectList = document.getElementById('subject-list');
    if (!subjectList) return;

    subjectList.innerHTML = '';

    if (subjects.length === 0) {
      subjectList.innerHTML = '<li class="no-subjects">No subjects available</li>';
      return;
    }

    subjects.forEach(subject => {
      const listItem = document.createElement('li');
      listItem.className = 'subject-item';
      
      const link = document.createElement('div');
      link.className = 'subject-link';
      link.innerHTML = `
        <span class="subject-icon">${subject.icon}</span>
        <span>${subject.name}</span>
        <span class="question-count">(${subject.questions.length} questions)</span>
      `;
      
      link.addEventListener('click', () => this.startQuiz(subject));
      
      listItem.appendChild(link);
      subjectList.appendChild(listItem);
    });
  }

  private startQuiz(subject: Subject): void {
    this.quizManager.startQuiz(subject);
    this.showQuizScreen();
    this.updateActiveSubject(subject.name);
    this.renderCurrentQuestion();
  }

  private updateActiveSubject(subjectName: string): void {
    document.querySelectorAll('.subject-link').forEach(link => {
      link.classList.remove('active');
    });
    
    const activeLink = Array.from(document.querySelectorAll('.subject-link'))
      .find(link => link.textContent?.includes(subjectName));
    
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  private showWelcomeScreen(): void {
    this.currentView = 'welcome';
    this.hideAllScreens();
    document.getElementById('welcome-screen')?.classList.remove('hidden');
  }

  private showQuizScreen(): void {
    this.currentView = 'quiz';
    this.hideAllScreens();
    document.getElementById('quiz-container')?.classList.remove('hidden');
  }

  private showResultsScreen(): void {
    this.currentView = 'results';
    this.hideAllScreens();
    document.getElementById('results-container')?.classList.remove('hidden');
  }

  private hideAllScreens(): void {
    document.getElementById('welcome-screen')?.classList.add('hidden');
    document.getElementById('quiz-container')?.classList.add('hidden');
    document.getElementById('results-container')?.classList.add('hidden');
  }

  private renderCurrentQuestion(): void {
    const question = this.quizManager.getCurrentQuestion();
    const subject = this.quizManager.getCurrentSubject();
    
    if (!question || !subject) return;

    // Update quiz title
    const titleElement = document.getElementById('quiz-title');
    if (titleElement) {
      titleElement.textContent = `${subject.name} Quiz`;
    }

    // Update progress
    const progress = this.quizManager.getProgress();
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) {
      progressFill.style.width = `${progress.percentage}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${progress.current} / ${progress.total}`;
    }

    // Update question
    const questionText = document.getElementById('question-text');
    if (questionText) {
      questionText.textContent = `${progress.current}. ${question.question}`;
    }

    // Update options
    this.renderOptions(question);
    
    // Update controls
    this.updateControls();
  }

  private renderOptions(question: any): void {
    const optionsContainer = document.getElementById('options-container');
    if (!optionsContainer) return;

    const options = [
      { key: 'A', text: question.optionA },
      { key: 'B', text: question.optionB },
      { key: 'C', text: question.optionC },
      { key: 'D', text: question.optionD }
    ];

    optionsContainer.innerHTML = '';
    const currentAnswer = this.quizManager.getCurrentAnswer();

    options.forEach(option => {
      const optionElement = document.createElement('div');
      optionElement.className = 'option';
      optionElement.innerHTML = `<strong>${option.key}.</strong> ${option.text}`;
      
      if (currentAnswer === option.key) {
        optionElement.classList.add('selected');
      }
      
      optionElement.addEventListener('click', () => {
        this.selectOption(option.key as 'A' | 'B' | 'C' | 'D');
      });
      
      optionsContainer.appendChild(optionElement);
    });
  }

  private selectOption(answer: 'A' | 'B' | 'C' | 'D'): void {
    this.quizManager.answerQuestion(answer);
    
    // Update visual selection
    document.querySelectorAll('.option').forEach(option => {
      option.classList.remove('selected');
    });
    
    const selectedOption = Array.from(document.querySelectorAll('.option'))
      .find(option => option.textContent?.startsWith(answer));
    
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }
    
    this.updateControls();
  }

  private updateControls(): void {
    const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
    const finishBtn = document.getElementById('finish-btn') as HTMLButtonElement;
    
    if (prevBtn) {
      prevBtn.disabled = !this.quizManager.canGoPrevious();
    }
    
    if (nextBtn && finishBtn) {
      const canGoNext = this.quizManager.canGoNext();
      const isComplete = this.quizManager.isQuizComplete();
      
      if (canGoNext) {
        nextBtn.classList.remove('hidden');
        finishBtn.classList.add('hidden');
        nextBtn.disabled = this.quizManager.getCurrentAnswer() === null;
      } else {
        nextBtn.classList.add('hidden');
        finishBtn.classList.remove('hidden');
        finishBtn.disabled = !isComplete;
      }
    }
  }

  private initializeEventListeners(): void {
    // Navigation controls
    document.getElementById('prev-btn')?.addEventListener('click', () => {
      if (this.quizManager.previousQuestion()) {
        this.renderCurrentQuestion();
      }
    });

    document.getElementById('next-btn')?.addEventListener('click', () => {
      if (this.quizManager.nextQuestion()) {
        this.renderCurrentQuestion();
      }
    });

    document.getElementById('finish-btn')?.addEventListener('click', () => {
      this.finishQuiz();
    });

    // Results controls
    document.getElementById('restart-btn')?.addEventListener('click', () => {
      this.restartQuiz();
    });

    document.getElementById('home-btn')?.addEventListener('click', () => {
      this.goHome();
    });
  }

  private finishQuiz(): void {
    const results = this.quizManager.finishQuiz();
    this.showResultsScreen();
    this.renderResults(results);
  }

  private renderResults(results: QuizResult[]): void {
    const subject = this.quizManager.getCurrentSubject();
    if (!subject) return;

    const correctCount = results.filter(r => r.isCorrect).length;
    const totalCount = results.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    // Update score display
    const scorePercentage = document.getElementById('score-percentage');
    const scoreText = document.getElementById('score-text');
    const scoreMessage = document.getElementById('score-message');

    if (scorePercentage) {
      scorePercentage.textContent = `${percentage}%`;
    }

    if (scoreText) {
      scoreText.textContent = `You scored ${correctCount} out of ${totalCount}`;
    }

    if (scoreMessage) {
      let message = '';
      if (percentage >= 90) message = 'Excellent work! 🎉';
      else if (percentage >= 80) message = 'Great job! 👏';
      else if (percentage >= 70) message = 'Good effort! 👍';
      else if (percentage >= 60) message = 'Keep practicing! 📚';
      else message = 'Don\'t give up! 💪';
      
      scoreMessage.textContent = message;
    }

    // Update score circle color
    const scoreCircle = document.querySelector('.score-circle') as HTMLElement;
    if (scoreCircle) {
      if (percentage >= 80) {
        scoreCircle.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      } else if (percentage >= 60) {
        scoreCircle.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      } else {
        scoreCircle.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      }
    }

    // Render detailed results
    this.renderDetailedResults(results);
  }

  private renderDetailedResults(results: QuizResult[]): void {
    const resultsList = document.getElementById('results-list');
    if (!resultsList) return;

    resultsList.innerHTML = '';

    results.forEach((result, index) => {
      const resultItem = document.createElement('div');
      resultItem.className = `result-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
      
      const userAnswerText = result.userAnswer 
        ? `${result.userAnswer}. ${result.options[result.userAnswer as keyof typeof result.options]}`
        : 'No answer';
      
      const correctAnswerText = `${result.correctAnswer}. ${result.options[result.correctAnswer as keyof typeof result.options]}`;
      
      resultItem.innerHTML = `
        <div class="result-question">
          <strong>Question ${index + 1}:</strong> ${result.question}
        </div>
        <div class="result-answer">
          <strong>Your answer:</strong> ${userAnswerText}
        </div>
        <div class="result-answer">
          <strong>Correct answer:</strong> ${correctAnswerText}
        </div>
      `;
      
      resultsList.appendChild(resultItem);
    });
  }

  private restartQuiz(): void {
    this.quizManager.resetQuiz();
    this.showQuizScreen();
    this.renderCurrentQuestion();
  }

  private goHome(): void {
    // Clear active subject
    document.querySelectorAll('.subject-link').forEach(link => {
      link.classList.remove('active');
    });
    
    this.showWelcomeScreen();
  }

  private showError(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-width: 300px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}