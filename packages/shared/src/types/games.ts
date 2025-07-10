export interface Game {
  id: string;
  name: string;
  category: string;
  indonesianTerms?: Record<string, string>;
  commonQuestions?: string[];
  metaInfo?: Record<string, any>;
}
