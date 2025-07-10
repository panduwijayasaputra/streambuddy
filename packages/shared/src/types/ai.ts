export interface AIResponse {
  id: string;
  questionPattern: string;
  responseTemplate: string;
  gameContext?: string;
  usageCount: number;
}
