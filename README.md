# Quiz Application

A modern, responsive quiz application that loads questions from CSV files with sidebar navigation and progress tracking.

## Features

- **Multi-Subject Support**: Load questions from multiple CSV files
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Progress Tracking**: Visual progress bar and question counters
- **Auto-Save**: Automatically saves progress using local storage
- **Modern UI**: Clean, professional interface with smooth animations
- **Detailed Results**: Comprehensive scoring with question-by-question breakdown

## CSV File Format

Place your CSV files in the `public/csv/` directory with the following format:

```csv
Subject,Question,Option A,Option B,Option C,Option D,Correct Answer
Mathematics,What is 2 + 2?,3,4,5,6,B
Science,What is H2O?,Water,Oxygen,Hydrogen,Carbon,A
```

### CSV Headers

- **Subject**: The subject name (optional, used for categorization)
- **Question**: The question text
- **Option A, Option B, Option C, Option D**: The four multiple choice options
- **Correct Answer**: The correct answer (A, B, C, or D)

## Adding New Subjects

1. Create a new CSV file in `public/csv/` directory
2. Follow the CSV format above
3. The application will automatically detect and load the new subject
4. Update the subject configuration in `src/csvParser.ts` if you want custom icons

## Usage

1. **Start the Application**: Run `npm run dev`
2. **Select a Subject**: Click on any subject in the sidebar
3. **Answer Questions**: Click your chosen answer for each question
4. **Navigate**: Use Previous/Next buttons to move between questions
5. **Finish Quiz**: Complete all questions to see your results
6. **View Results**: Get detailed scoring and question breakdown

## Technical Details

- Built with TypeScript and Vite
- Uses PapaParse for CSV parsing
- Responsive CSS Grid and Flexbox layout
- Local storage for progress persistence
- Modular architecture with separate managers for CSV parsing, quiz logic, and UI

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## File Structure

```
src/
├── main.ts          # Application entry point
├── ui.ts            # UI management and rendering
├── quizManager.ts   # Quiz logic and state management
├── csvParser.ts     # CSV file parsing and data loading
├── types.ts         # TypeScript type definitions
└── style.css        # Application styles

public/
└── csv/             # CSV data files
    ├── mathematics.csv
    ├── science.csv
    ├── history.csv
    └── english.csv
```