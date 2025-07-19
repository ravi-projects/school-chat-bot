import Papa from 'papaparse';
import { Question, Subject } from './types';

export class CSVParser {
  private static instance: CSVParser;
  private subjects: Subject[] = [];

  private constructor() {}

  public static getInstance(): CSVParser {
    if (!CSVParser.instance) {
      CSVParser.instance = new CSVParser();
    }
    return CSVParser.instance;
  }

  public async loadSubjects(): Promise<Subject[]> {
    const subjectConfigs = [
      { name: 'Mathematics', icon: '🔢', filename: 'mathematics.csv' },
      { name: 'Science', icon: '🔬', filename: 'science.csv' },
      { name: 'History', icon: '📚', filename: 'history.csv' },
      { name: 'English', icon: '📝', filename: 'english.csv' }
    ];

    this.subjects = [];

    for (const config of subjectConfigs) {
      try {
        const questions = await this.loadQuestionsFromCSV(config.filename);
        if (questions.length > 0) {
          this.subjects.push({
            name: config.name,
            icon: config.icon,
            filename: config.filename,
            questions
          });
        }
      } catch (error) {
        console.warn(`Failed to load ${config.filename}:`, error);
      }
    }

    return this.subjects;
  }

  private async loadQuestionsFromCSV(filename: string): Promise<Question[]> {
    try {
      const response = await fetch(`/csv/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => {
            // Normalize header names
            const normalized = header.trim().toLowerCase();
            switch (normalized) {
              case 'subject': return 'subject';
              case 'question': return 'question';
              case 'option a': case 'optiona': return 'optionA';
              case 'option b': case 'optionb': return 'optionB';
              case 'option c': case 'optionc': return 'optionC';
              case 'option d': case 'optiond': return 'optionD';
              case 'correct answer': case 'correctanswer': case 'answer': return 'correctAnswer';
              default: return header;
            }
          },
          complete: (results) => {
            try {
              const questions: Question[] = results.data
                .filter((row: any) => row.question && row.question.trim())
                .map((row: any) => ({
                  subject: row.subject || '',
                  question: row.question.trim(),
                  optionA: row.optionA?.trim() || '',
                  optionB: row.optionB?.trim() || '',
                  optionC: row.optionC?.trim() || '',
                  optionD: row.optionD?.trim() || '',
                  correctAnswer: this.normalizeAnswer(row.correctAnswer)
                }))
                .filter(q => q.question && q.optionA && q.optionB && q.optionC && q.optionD);

              resolve(questions);
            } catch (error) {
              reject(error);
            }
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      return [];
    }
  }

  private normalizeAnswer(answer: string): 'A' | 'B' | 'C' | 'D' {
    if (!answer) return 'A';
    
    const normalized = answer.toString().trim().toUpperCase();
    
    if (['A', 'B', 'C', 'D'].includes(normalized)) {
      return normalized as 'A' | 'B' | 'C' | 'D';
    }
    
    // Handle numeric answers (1=A, 2=B, 3=C, 4=D)
    const numericMap: { [key: string]: 'A' | 'B' | 'C' | 'D' } = {
      '1': 'A', '2': 'B', '3': 'C', '4': 'D'
    };
    
    if (numericMap[normalized]) {
      return numericMap[normalized];
    }
    
    // Default to A if we can't parse
    console.warn(`Could not parse answer: ${answer}, defaulting to A`);
    return 'A';
  }

  public getSubjects(): Subject[] {
    return this.subjects;
  }

  public getSubjectByName(name: string): Subject | undefined {
    return this.subjects.find(subject => subject.name === name);
  }
}