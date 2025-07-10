export interface StreamSession {
  id: string;
  streamerName: string;
  gameBeingPlayed?: string;
  viewerCount: number;
  startTime: Date;
  endTime?: Date;
}
