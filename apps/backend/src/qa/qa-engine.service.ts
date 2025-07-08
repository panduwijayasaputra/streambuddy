import fetch from "node-fetch";

type Game = "mobile_legends" | "free_fire" | "valorant";

interface QATemplate {
  pattern: RegExp;
  response: (params?: Record<string, string>, context?: QAContext) => string;
}

export interface QAContext {
  streamStart?: Date;
  currentGame?: string;
  viewerCount?: number;
}

const templates: Record<Game | "stream_context", QATemplate[]> = {
  mobile_legends: [
    {
      pattern: /build (.+)/i,
      response: (params = {}) => {
        const hero = params.hero || "[hero]";
        return `Build paling GG buat ${hero}: [item1, item2, item3]. Gas pol, bro! #MLBB`;
      },
    },
    {
      pattern: /counter (.+)/i,
      response: (params = {}) => {
        const hero = params.hero || "[hero]";
        return `Waduh, ${hero}? Tenang, lawan aja pake [counterHero1, counterHero2], auto win!`;
      },
    },
    {
      pattern: /meta hero/i,
      response: () =>
        "Meta hero MLBB versi StreamBuddy: [HeroA, HeroB, HeroC]. Jangan lupa pick, biar ga di-report!",
    },
  ],
  free_fire: [
    {
      pattern: /senjata terbaik/i,
      response: () =>
        "Senjata paling sakit di FF: MP40, M1014, AK47. Cobain deh, auto booyah!",
    },
    {
      pattern: /karakter meta/i,
      response: () =>
        "Karakter meta Free Fire: Chrono, Alok, Skyler. Biar makin barbar!",
    },
  ],
  valorant: [
    {
      pattern: /agent mudah/i,
      response: () =>
        "Baru main Valorant? Coba Sage, Reyna, Omen. Gampang dipake, ga ribet!",
    },
    {
      pattern: /tips aim/i,
      response: () =>
        "Tips aim biar makin jago: sens rendah, crosshair placement, latihan di range. Jangan panik, santai aja!",
    },
  ],
  stream_context: [
    {
      pattern:
        /berapa lama streaming|sudah berapa lama streaming|durasi streaming/i,
      response: (_params, context) => {
        if (!context?.streamStart)
          return "Belum tau nih, streamer mulai jam berapa. Tanya lagi bentar ya!";
        const now = new Date();
        const ms = now.getTime() - context.streamStart.getTime();
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `Udah live ${hours} jam ${minutes} menit, ga kerasa ya! #streamerkuat`;
      },
    },
    {
      pattern: /main game apa|game apa|lagi main apa/i,
      response: (_params, context) => {
        return context?.currentGame
          ? `Sekarang lagi push rank di ${context.currentGame}, join kuy!`
          : "Belum tau nih, streamer lagi main apa. Sabar ya!";
      },
    },
    {
      pattern: /berapa penonton|viewer sekarang|jumlah penonton/i,
      response: (_params, context) => {
        return context?.viewerCount !== undefined
          ? `Viewers sekarang: ${context.viewerCount} orang. Mantap, rame banget!`
          : "Belum tau jumlah viewers-nya, sabar ya bro!";
      },
    },
  ],
};

export class QAEngineService {
  getTemplateResponse(
    game: Game,
    question: string,
    context?: QAContext
  ): string | null {
    // Check stream context templates first
    for (const tmpl of templates.stream_context) {
      const match = tmpl.pattern.exec(question);
      if (match) {
        return tmpl.response({}, context);
      }
    }
    // Then check game-specific templates
    const gameTemplates = templates[game];
    for (const tmpl of gameTemplates) {
      const match = tmpl.pattern.exec(question);
      if (match) {
        // If the template expects a hero/param, pass it
        if (match.length > 1) {
          return tmpl.response({ hero: match[1] }, context);
        }
        return tmpl.response({}, context);
      }
    }
    return null;
  }

  async getResponse(
    game: Game,
    question: string,
    context?: QAContext
  ): Promise<string> {
    const template = this.getTemplateResponse(game, question, context);
    if (template) return template;
    // Fallback to OpenAI
    return await this.getOpenAIFallback(question);
  }

  async getOpenAIFallback(question: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return "OpenAI API key not configured.";
    const prompt = `Jawab pertanyaan berikut sebagai AI co-host gaming Indonesia, pake bahasa santai streamer, campur Indo-Inggris, dan tambahin slang/gaming lingo kalau cocok. Jangan terlalu formal. Jawab: ${question}`;
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt,
        max_tokens: 60,
        temperature: 0.7,
      }),
    });
    if (!response.ok) return "Maaf, StreamBuddy tidak bisa menjawab sekarang.";
    const data = (await response.json()) as { choices?: { text?: string }[] };
    return (
      data.choices?.[0]?.text?.trim() ||
      "Maaf, StreamBuddy tidak tahu jawabannya."
    );
  }
}
