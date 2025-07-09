import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

interface Props {
  params: { streamId: string };
}

export default function AnalyticsPage({ params }: Props) {
  return (
    <main style={{ padding: 32 }}>
      <h1>Analytics for Stream: {params.streamId}</h1>
      <AnalyticsDashboard streamId={params.streamId} />
    </main>
  );
}
