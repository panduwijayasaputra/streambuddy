"use client";
import React, { useState, useEffect } from "react";
import "./PersonalizationPanel.css";

interface PersonalizationSettings {
  buddyName: string;
  avatarUrl: string;
  theme: "light" | "dark";
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  bubbleStyle: "rounded" | "sharp" | "minimal";
  avatarSize: "small" | "medium" | "large";
  animationSpeed: "slow" | "normal" | "fast";
}

interface PersonalizationPanelProps {
  streamId: string;
  onSettingsChange: (settings: PersonalizationSettings) => void;
  initialSettings?: Partial<PersonalizationSettings>;
}

export const PersonalizationPanel: React.FC<PersonalizationPanelProps> = ({
  streamId: _streamId,
  onSettingsChange,
  initialSettings = {},
}) => {
  const [settings, setSettings] = useState<PersonalizationSettings>({
    buddyName: "StreamBuddy",
    avatarUrl: "/api/avatar/default",
    theme: "dark",
    position: "bottom-right",
    bubbleStyle: "rounded",
    avatarSize: "medium",
    animationSpeed: "normal",
    ...initialSettings,
  });

  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  const handleSettingChange = (
    key: keyof PersonalizationSettings,
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleSettingChange("avatarUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      buddyName: "StreamBuddy",
      avatarUrl: "/api/avatar/default",
      theme: "dark",
      position: "bottom-right",
      bubbleStyle: "rounded",
      avatarSize: "medium",
      animationSpeed: "normal",
    });
  };

  return (
    <div className="personalization-panel">
      <div className="panel-header">
        <h2>StreamBuddy Personalization</h2>
        <p>Customize your StreamBuddy overlay appearance and behavior</p>
      </div>

      <div className="panel-content">
        {/* Basic Settings */}
        <section className="settings-section">
          <h3>Basic Settings</h3>

          <div className="setting-group">
            <label htmlFor="buddyName">Buddy Name</label>
            <input
              id="buddyName"
              type="text"
              value={settings.buddyName}
              onChange={(e) => handleSettingChange("buddyName", e.target.value)}
              placeholder="Enter your buddy's name"
              className="text-input"
            />
          </div>

          <div className="setting-group">
            <label htmlFor="avatarUpload">Avatar</label>
            <div className="avatar-upload-container">
              <img
                src={settings.avatarUrl}
                alt="Avatar preview"
                className="avatar-preview"
              />
              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="file-input"
              />
              <label htmlFor="avatarUpload" className="upload-button">
                Upload New Avatar
              </label>
            </div>
          </div>
        </section>

        {/* Appearance Settings */}
        <section className="settings-section">
          <h3>Appearance</h3>

          <div className="setting-group">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={settings.theme}
              onChange={(e) => handleSettingChange("theme", e.target.value)}
              className="select-input"
            >
              <option value="dark">Dark Theme</option>
              <option value="light">Light Theme</option>
            </select>
          </div>

          <div className="setting-group">
            <label htmlFor="position">Position</label>
            <select
              id="position"
              value={settings.position}
              onChange={(e) => handleSettingChange("position", e.target.value)}
              className="select-input"
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
          </div>

          <div className="setting-group">
            <label htmlFor="bubbleStyle">Chat Bubble Style</label>
            <select
              id="bubbleStyle"
              value={settings.bubbleStyle}
              onChange={(e) =>
                handleSettingChange("bubbleStyle", e.target.value)
              }
              className="select-input"
            >
              <option value="rounded">Rounded</option>
              <option value="sharp">Sharp</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <div className="setting-group">
            <label htmlFor="avatarSize">Avatar Size</label>
            <select
              id="avatarSize"
              value={settings.avatarSize}
              onChange={(e) =>
                handleSettingChange("avatarSize", e.target.value)
              }
              className="select-input"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </section>

        {/* Animation Settings */}
        <section className="settings-section">
          <h3>Animation</h3>

          <div className="setting-group">
            <label htmlFor="animationSpeed">Animation Speed</label>
            <select
              id="animationSpeed"
              value={settings.animationSpeed}
              onChange={(e) =>
                handleSettingChange("animationSpeed", e.target.value)
              }
              className="select-input"
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>
        </section>

        {/* Preview Section */}
        <section className="settings-section">
          <h3>Preview</h3>

          <div className="preview-controls">
            <button
              type="button"
              onClick={() => setPreviewVisible(!previewVisible)}
              className="preview-button"
            >
              {previewVisible ? "Hide Preview" : "Show Preview"}
            </button>
          </div>

          {previewVisible && (
            <div className="preview-container">
              <div className="preview-message">
                <div className="preview-bubble">
                  <div className="preview-header">
                    <span className="preview-name">{settings.buddyName}</span>
                    <span className="preview-time">12:34:56</span>
                  </div>
                  <div className="preview-content">
                    Hello! This is a preview of how your StreamBuddy will look.
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Actions */}
        <section className="settings-section">
          <div className="action-buttons">
            <button
              type="button"
              onClick={resetToDefaults}
              className="reset-button"
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              onClick={() => onSettingsChange(settings)}
              className="save-button"
            >
              Save Settings
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
