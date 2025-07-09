import { AnalyticsService } from "./analytics.service";
import { AnalyticsSnapshotEntity } from "./analytics-snapshot.entity";

const makeRepo = () => {
  const store: AnalyticsSnapshotEntity[] = [];
  return {
    create: (data: any) => ({ ...data }),
    save: async (entity: any) => {
      store.push(entity);
      return entity;
    },
    find: async (opts: any) => {
      // Simple filter for streamId and timestamp
      return store.filter(
        (s) =>
          (!opts.where.streamId || s.streamId === opts.where.streamId) &&
          (!opts.where.timestamp?.$gte ||
            (s.timestamp && s.timestamp >= opts.where.timestamp.$gte))
      );
    },
    _store: store,
  };
};

describe("AnalyticsService", () => {
  let service: AnalyticsService;
  let repo: ReturnType<typeof makeRepo>;

  beforeEach(() => {
    repo = makeRepo();
    // @ts-ignore
    service = new AnalyticsService(repo);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("aggregates and flushes stats to repo", async () => {
    await service.recordMessage(
      {
        userId: "u1",
        streamId: "s1",
        message: "hi",
        platform: "youtube",
        timestamp: new Date(),
      },
      true,
      true,
      false
    );
    await service.recordMessage(
      {
        userId: "u2",
        streamId: "s1",
        message: "yo",
        platform: "youtube",
        timestamp: new Date(),
      },
      false,
      false,
      false
    );
    await service.flushAll();
    expect(repo._store.length).toBe(1);
    const snap = repo._store[0];
    expect(snap.totalMessages).toBe(2);
    expect(snap.totalMentions).toBe(1);
    expect(snap.totalResponses).toBe(1);
    expect(snap.uniqueViewers).toBe(2);
  });

  it("getSnapshot aggregates over interval", async () => {
    const now = new Date();
    repo._store.push(
      {
        streamId: "s1",
        timestamp: new Date(now.getTime() - 1000 * 60 * 10),
        totalMessages: 5,
        totalMentions: 2,
        totalResponses: 1,
        openaiResponses: 0,
        uniqueViewers: 3,
      },
      {
        streamId: "s1",
        timestamp: new Date(now.getTime() - 1000 * 60 * 5),
        totalMessages: 7,
        totalMentions: 3,
        totalResponses: 2,
        openaiResponses: 1,
        uniqueViewers: 4,
      }
    );
    // @ts-ignore
    const result = await service.getSnapshot("s1", "1h");
    expect(result.totalMessages).toBe(12);
    expect(result.totalMentions).toBe(5);
    expect(result.totalResponses).toBe(3);
    expect(result.openaiResponses).toBe(1);
    expect(result.uniqueViewers).toBe(7); // sum of uniqueViewers fields
  });

  it("getTrends returns time-series data", async () => {
    const now = new Date();
    repo._store.push(
      {
        streamId: "s1",
        timestamp: new Date(now.getTime() - 1000 * 60 * 10),
        totalMessages: 5,
        totalMentions: 2,
        totalResponses: 1,
        openaiResponses: 0,
        uniqueViewers: 3,
      },
      {
        streamId: "s1",
        timestamp: new Date(now.getTime() - 1000 * 60 * 5),
        totalMessages: 7,
        totalMentions: 3,
        totalResponses: 2,
        openaiResponses: 1,
        uniqueViewers: 4,
      }
    );
    // @ts-ignore
    const result = await service.getTrends("s1", "1h");
    expect(result.length).toBe(2);
    expect(result[0].totalMessages).toBe(5);
    expect(result[1].totalMessages).toBe(7);
  });
});
