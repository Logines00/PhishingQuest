export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export interface EmailSender {
  name: string;
  email: string;
}

export interface Email {
  id: string;
  from: EmailSender;
  subject: string;
  date: string;
  body: string;
  isPhishing: boolean;
  difficulty: Difficulty;
  indicators: string[];
  explanation: string;
}
