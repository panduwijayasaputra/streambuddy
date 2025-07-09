import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PersonalizationPanel } from "./PersonalizationPanel";

// Mock FileReader
const mockFileReader = {
  readAsDataURL: jest.fn(),
  result: "data:image/jpeg;base64,mock-image-data",
};

global.FileReader = jest.fn(() => mockFileReader as any);

describe("PersonalizationPanel", () => {
  const mockOnSettingsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.FileReader as jest.Mock).mockImplementation(() => mockFileReader);
  });

  it("renders with default settings", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    expect(screen.getByText("StreamBuddy Personalization")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Customize your StreamBuddy overlay appearance and behavior"
      )
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("StreamBuddy")).toBeInTheDocument();
  });

  it("renders with custom initial settings", () => {
    const initialSettings = {
      buddyName: "CustomBuddy",
      theme: "light" as const,
      position: "top-left" as const,
    };

    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
        initialSettings={initialSettings}
      />
    );

    expect(screen.getByDisplayValue("CustomBuddy")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Light Theme")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Top Left")).toBeInTheDocument();
  });

  it("updates buddy name when input changes", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    const nameInput = screen.getByDisplayValue("StreamBuddy");
    fireEvent.change(nameInput, { target: { value: "NewBuddyName" } });

    expect(nameInput).toHaveValue("NewBuddyName");
  });

  it("updates theme when select changes", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    const themeSelect = screen.getByDisplayValue("Dark Theme");
    fireEvent.change(themeSelect, { target: { value: "light" } });

    expect(themeSelect).toHaveValue("light");
  });

  it("updates position when select changes", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    const positionSelect = screen.getByDisplayValue("Bottom Right");
    fireEvent.change(positionSelect, { target: { value: "top-left" } });

    expect(positionSelect).toHaveValue("top-left");
  });

  it("updates bubble style when select changes", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    const bubbleStyleSelect = screen.getByDisplayValue("Rounded");
    fireEvent.change(bubbleStyleSelect, { target: { value: "sharp" } });

    expect(bubbleStyleSelect).toHaveValue("sharp");
  });

  it("updates avatar size when select changes", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    const avatarSizeSelect = screen.getByDisplayValue("Medium");
    fireEvent.change(avatarSizeSelect, { target: { value: "large" } });

    expect(avatarSizeSelect).toHaveValue("large");
  });

  it("updates animation speed when select changes", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    const animationSpeedSelect = screen.getByDisplayValue("Normal");
    fireEvent.change(animationSpeedSelect, { target: { value: "fast" } });

    expect(animationSpeedSelect).toHaveValue("fast");
  });

  it("handles avatar upload", async () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    const file = new File(["mock-image"], "avatar.jpg", { type: "image/jpeg" });
    const fileInput = screen.getByLabelText("Upload New Avatar");

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
    });
  });

  it("shows preview when preview button is clicked", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    const previewButton = screen.getByText("Show Preview");
    fireEvent.click(previewButton);

    expect(screen.getByText("Hide Preview")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Hello! This is a preview of how your StreamBuddy will look."
      )
    ).toBeInTheDocument();
  });

  it("hides preview when hide button is clicked", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    const previewButton = screen.getByText("Show Preview");
    fireEvent.click(previewButton);

    const hideButton = screen.getByText("Hide Preview");
    fireEvent.click(hideButton);

    expect(screen.getByText("Show Preview")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Hello! This is a preview of how your StreamBuddy will look."
      )
    ).not.toBeInTheDocument();
  });

  it("updates preview when settings change", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    // Show preview
    const previewButton = screen.getByText("Show Preview");
    fireEvent.click(previewButton);

    // Change buddy name
    const nameInput = screen.getByDisplayValue("StreamBuddy");
    fireEvent.change(nameInput, { target: { value: "CustomName" } });

    // Check that preview shows updated name
    expect(screen.getByText("CustomName")).toBeInTheDocument();
  });

  it("resets to defaults when reset button is clicked", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    // Change some settings
    const nameInput = screen.getByDisplayValue("StreamBuddy");
    fireEvent.change(nameInput, { target: { value: "CustomName" } });

    // Click reset button
    const resetButton = screen.getByText("Reset to Defaults");
    fireEvent.click(resetButton);

    // Check that settings are reset
    expect(screen.getByDisplayValue("StreamBuddy")).toBeInTheDocument();
  });

  it("calls onSettingsChange when save button is clicked", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    const saveButton = screen.getByText("Save Settings");
    fireEvent.click(saveButton);

    expect(mockOnSettingsChange).toHaveBeenCalledWith({
      buddyName: "StreamBuddy",
      avatarUrl: "/api/avatar/default",
      theme: "dark",
      position: "bottom-right",
      bubbleStyle: "rounded",
      avatarSize: "medium",
      animationSpeed: "normal",
    });
  });

  it("calls onSettingsChange when settings are modified", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    const nameInput = screen.getByDisplayValue("StreamBuddy");
    fireEvent.change(nameInput, { target: { value: "NewName" } });

    expect(mockOnSettingsChange).toHaveBeenCalledWith({
      buddyName: "NewName",
      avatarUrl: "/api/avatar/default",
      theme: "dark",
      position: "bottom-right",
      bubbleStyle: "rounded",
      avatarSize: "medium",
      animationSpeed: "normal",
    });
  });

  it("displays avatar preview", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    const avatarPreview = screen.getByAltText("Avatar preview");
    expect(avatarPreview).toBeInTheDocument();
    expect(avatarPreview).toHaveAttribute("src", "/api/avatar/default");
  });

  it("has all required form controls", () => {
    render(
      <PersonalizationPanel
        streamId="test-stream"
        onSettingsChange={mockOnSettingsChange}
      />
    );

    expect(screen.getByLabelText("Buddy Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Theme")).toBeInTheDocument();
    expect(screen.getByLabelText("Position")).toBeInTheDocument();
    expect(screen.getByLabelText("Chat Bubble Style")).toBeInTheDocument();
    expect(screen.getByLabelText("Avatar Size")).toBeInTheDocument();
    expect(screen.getByLabelText("Animation Speed")).toBeInTheDocument();
  });
});
