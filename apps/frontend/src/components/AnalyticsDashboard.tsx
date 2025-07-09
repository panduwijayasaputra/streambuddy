"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface Snapshot {
  totalMessages: number;
  totalMentions: number;
  totalResponses: number;
  openaiResponses: number;
  uniqueViewers: number;
  interval: string;
  count: number;
}

interface TrendPoint {
  timestamp: string;
  totalMessages: number;
  totalMentions: number;
  totalResponses: number;
  openaiResponses: number;
  uniqueViewers: number;
}

export const AnalyticsDashboard: React.FC<{ streamId: string }> = ({
  streamId,
}) => {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const snapRes = await fetch(
        `http://localhost:3001/api/analytics/${streamId}/snapshot?interval=1h`
      );
      const snapData = await snapRes.json();
      setSnapshot(snapData);
      const trendsRes = await fetch(
        `http://localhost:3001/api/analytics/${streamId}/trends?range=24h`
      );
      const trendsData = await trendsRes.json();
      setTrends(Array.isArray(trendsData) ? trendsData : []);
      setLoading(false);
    }
    fetchData();
  }, [streamId]);

  if (loading) return <div>Loading analytics...</div>;
  if (!snapshot) return <div>No analytics data available.</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <nav style={{ marginBottom: 24 }}>
        <Link href="/">← Home</Link>
      </nav>
      <h2 style={{ marginBottom: 16 }}>Stream Analytics</h2>
      <section
        style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 32 }}
      >
        <Metric label="Total Messages" value={snapshot.totalMessages} />
        <Metric label="Mentions" value={snapshot.totalMentions} />
        <Metric label="AI Responses" value={snapshot.totalResponses} />
        <Metric label="OpenAI Responses" value={snapshot.openaiResponses} />
        <Metric label="Unique Viewers" value={snapshot.uniqueViewers} />
      </section>
      <section>
        <h3 style={{ marginBottom: 16 }}>Engagement Over Time</h3>
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px #0001",
            padding: 16,
          }}
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={trends}
              margin={{ top: 16, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(t) => t.slice(11, 16)}
                minTickGap={32}
              />
              <YAxis allowDecimals={false} />
              <Tooltip labelFormatter={(l) => new Date(l).toLocaleString()} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalMessages"
                stroke="#0070f3"
                name="Messages"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="totalMentions"
                stroke="#f39c12"
                name="Mentions"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div
    style={{
      minWidth: 140,
      background: "#f5f5f5",
      borderRadius: 8,
      padding: 16,
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    <div style={{ color: "#666", fontSize: 14 }}>{label}</div>
  </div>
);
