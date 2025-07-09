import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { AnalyticsSnapshotEntity } from "./analytics-snapshot.entity";
import { ChatMessage } from "../chat/chat.service";

interface InMemoryStats {
  totalMessages: number;
  totalMentions: number;
  totalResponses: number;
  openaiResponses: number;
  uniqueViewers: Set<string>;
  lastFlushed: Date;
}

@Injectable()
export class AnalyticsService implements OnModuleInit, OnModuleDestroy {
  private stats: Record<string, InMemoryStats> = {}; // streamId -> stats
  private flushIntervalMs = 60_000; // 1 minute
  private flushTimer?: NodeJS.Timeout;

  constructor(
    @InjectRepository(AnalyticsSnapshotEntity)
    private readonly analyticsRepo: Repository<AnalyticsSnapshotEntity>
  ) {}

  onModuleInit() {
    this.flushTimer = setInterval(() => this.flushAll(), this.flushIntervalMs);
  }

  onModuleDestroy() {
    clearInterval(this.flushTimer);
  }

  async recordMessage(
    msg: ChatMessage,
    isMentioned: boolean,
    isAIResponse: boolean,
    isOpenAI: boolean
  ) {
    const streamId = msg.streamId || "default";
    if (!this.stats[streamId]) {
      this.stats[streamId] = {
        totalMessages: 0,
        totalMentions: 0,
        totalResponses: 0,
        openaiResponses: 0,
        uniqueViewers: new Set(),
        lastFlushed: new Date(),
      };
    }
    const s = this.stats[streamId];
    s.totalMessages++;
    if (isMentioned) s.totalMentions++;
    if (isAIResponse) s.totalResponses++;
    if (isOpenAI) s.openaiResponses++;
    s.uniqueViewers.add(msg.userId);
  }

  async flushAll() {
    const now = new Date();
    for (const [streamId, s] of Object.entries(this.stats)) {
      // Save snapshot
      const snapshot = this.analyticsRepo.create({
        streamId,
        timestamp: now,
        totalMessages: s.totalMessages,
        totalMentions: s.totalMentions,
        totalResponses: s.totalResponses,
        openaiResponses: s.openaiResponses,
        uniqueViewers: s.uniqueViewers.size,
      });
      await this.analyticsRepo.save(snapshot);
      // Reset stats for next interval
      this.stats[streamId] = {
        totalMessages: 0,
        totalMentions: 0,
        totalResponses: 0,
        openaiResponses: 0,
        uniqueViewers: new Set(),
        lastFlushed: now,
      };
    }
  }

  // Get aggregated stats for a stream/time window
  async getSnapshot(streamId: string, interval: string = "1h") {
    // Find the latest snapshot within the interval
    const now = new Date();
    let since = new Date(now.getTime());
    if (interval.endsWith("h")) {
      since.setHours(now.getHours() - parseInt(interval));
    } else if (interval.endsWith("m")) {
      since.setMinutes(now.getMinutes() - parseInt(interval));
    } else {
      // Default to 1 hour
      since.setHours(now.getHours() - 1);
    }
    const snapshots = await this.analyticsRepo.find({
      where: { streamId, timestamp: { $gte: since } },
      order: { timestamp: "DESC" },
    } as any);
    // Aggregate stats over the interval
    const agg = {
      totalMessages: 0,
      totalMentions: 0,
      totalResponses: 0,
      openaiResponses: 0,
      uniqueViewers: 0,
    };
    const viewersSet = new Set<string>();
    for (const snap of snapshots) {
      agg.totalMessages += snap.totalMessages || 0;
      agg.totalMentions += snap.totalMentions || 0;
      agg.totalResponses += snap.totalResponses || 0;
      agg.openaiResponses += snap.openaiResponses || 0;
      agg.uniqueViewers += snap.uniqueViewers || 0;
    }
    return { ...agg, interval, count: snapshots.length };
  }

  // Get time-series data for dashboard graphs
  async getTrends(streamId: string, range: string = "24h") {
    // Find all snapshots in the range
    const now = new Date();
    let since = new Date(now.getTime());
    if (range.endsWith("h")) {
      since.setHours(now.getHours() - parseInt(range));
    } else if (range.endsWith("m")) {
      since.setMinutes(now.getMinutes() - parseInt(range));
    } else {
      // Default to 24 hours
      since.setHours(now.getHours() - 24);
    }
    const snapshots = await this.analyticsRepo.find({
      where: { streamId, timestamp: { $gte: since } },
      order: { timestamp: "ASC" },
    } as any);
    // Return time-series data
    return snapshots.map((snap) => ({
      timestamp: snap.timestamp,
      totalMessages: snap.totalMessages,
      totalMentions: snap.totalMentions,
      totalResponses: snap.totalResponses,
      openaiResponses: snap.openaiResponses,
      uniqueViewers: snap.uniqueViewers,
    }));
  }
}
