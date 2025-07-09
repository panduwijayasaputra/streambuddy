import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AnalyticsDashboard } from "./AnalyticsDashboard";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink(props: { children: React.ReactNode; href: string }) {
    return <a href={props.href}>{props.children}</a>;
  };
});

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("AnalyticsDashboard", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("renders loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<AnalyticsDashboard streamId="test-stream" />);
    expect(screen.getByText(/Loading analytics/i)).toBeInTheDocument();
  });

  it("renders metrics and chart when data is loaded", async () => {
    const mockSnapshot = {
      totalMessages: 42,
      totalMentions: 10,
      totalResponses: 7,
      openaiResponses: 2,
      uniqueViewers: 5,
      interval: "1h",
      count: 3,
    };

    const mockTrends = [
      {
        timestamp: "2024-07-08T10:00:00Z",
        totalMessages: 10,
        totalMentions: 2,
        totalResponses: 1,
        openaiResponses: 0,
        uniqueViewers: 3,
      },
      {
        timestamp: "2024-07-08T11:00:00Z",
        totalMessages: 32,
        totalMentions: 8,
        totalResponses: 6,
        openaiResponses: 2,
        uniqueViewers: 5,
      },
    ];

    mockFetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockSnapshot),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockTrends),
      });

    render(<AnalyticsDashboard streamId="test-stream" />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText(/Total Messages/i)).toBeInTheDocument();
    });

    // Check metrics are displayed
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText(/Mentions/i)).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText(/AI Responses/i)).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText(/OpenAI Responses/i)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/Unique Viewers/i)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    // Check chart section
    expect(screen.getByText(/Engagement Over Time/i)).toBeInTheDocument();
  });

  it("renders no data message when snapshot is null", async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve(null),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve([]),
      });

    render(<AnalyticsDashboard streamId="test-stream" />);

    await waitFor(() => {
      expect(
        screen.getByText(/No analytics data available/i)
      ).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("API Error"));

    render(<AnalyticsDashboard streamId="test-stream" />);

    // Should show loading initially
    expect(screen.getByText(/Loading analytics/i)).toBeInTheDocument();

    // Should eventually show no data message
    await waitFor(() => {
      expect(
        screen.getByText(/No analytics data available/i)
      ).toBeInTheDocument();
    });
  });

  it("calls correct API endpoints with streamId", async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ totalMessages: 0 }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve([]),
      });

    render(<AnalyticsDashboard streamId="test-stream-123" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/analytics/test-stream-123/snapshot?interval=1h"
      );
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/analytics/test-stream-123/trends?range=24h"
      );
    });
  });
});
