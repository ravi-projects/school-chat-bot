import './style.css';
import { UIManager } from './ui';

class App {
  private uiManager: UIManager;

  constructor() {
    this.uiManager = new UIManager();
  }

  public async init(): Promise<void> {
    try {
      await this.uiManager.initialize();
      console.log('Quiz application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize quiz application:', error);
      this.showInitializationError();
    }
  }

  private showInitializationError(): void {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          padding: 2rem;
        ">
          <div style="
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 1rem;
            max-width: 500px;
          ">
            <h1 style="margin-bottom: 1rem;">⚠️ Initialization Error</h1>
            <p style="margin-bottom: 1rem;">
              Failed to load the quiz application. Please check that your CSV files are properly formatted and accessible.
            </p>
            <button onclick="location.reload()" style="
              background: #4f46e5;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-weight: 600;
            ">
              Retry
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});