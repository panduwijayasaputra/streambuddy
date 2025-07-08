function normalize(text: string): string {
  // Lowercase, remove diacritics (combining marks), trim, and collapse whitespace
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // Remove all combining marks
    .replace(/\s+/g, " ")
    .trim();
}

export class MentionService {
  private defaultMentions = [
    "@streambuddy",
    "@buddy",
    "@sb",
    "@budi",
    "@teman",
    "@temen",
    "@bot",
    "@cohost",
    "@co-host",
    "@temanstream",
    "@temanmain",
    "@temenmain",
  ];
  private mentionNames: string[];

  constructor(mentionNames: string[] = []) {
    if (mentionNames.length === 0) {
      this.mentionNames = this.defaultMentions.map(normalize);
    } else {
      this.mentionNames = mentionNames.map(normalize);
    }
  }

  /**
   * Returns true if the message contains any of the mention names (case-insensitive, normalized)
   */
  isMentioned(message: string): boolean {
    if (!message) return false;
    const norm = normalize(message);
    return this.mentionNames.some((name) => norm.includes(name));
  }

  /**
   * Set or update the mention names (e.g., for streamer customization)
   */
  setMentionNames(names: string[]) {
    this.mentionNames = names.map(normalize);
  }
}
