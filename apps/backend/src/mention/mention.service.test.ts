import { MentionService } from "./mention.service";

declare function normalize(text: string): string;

describe("MentionService", () => {
  let service: MentionService;

  beforeEach(() => {
    service = new MentionService();
  });

  it("detects standard mentions", () => {
    expect(service.isMentioned("Hi @StreamBuddy!")).toBe(true);
    expect(service.isMentioned("hello @buddy")).toBe(true);
  });

  it("detects slang/variation mentions", () => {
    expect(service.isMentioned("ada pertanyaan buat @sb?")).toBe(true);
    expect(service.isMentioned("halo @budi")).toBe(true);
    expect(service.isMentioned("tanya @teman dong")).toBe(true);
    expect(service.isMentioned("main bareng @temen")).toBe(true);
    expect(service.isMentioned("panggil @bot")).toBe(true);
    expect(service.isMentioned("ada @cohost di sini")).toBe(true);
    expect(service.isMentioned("ada @co-host di sini")).toBe(true);
    expect(service.isMentioned("halo @temanstream")).toBe(true);
    expect(service.isMentioned("halo @temanmain")).toBe(true);
    expect(service.isMentioned("halo @temenmain")).toBe(true);
  });

  it("is case-insensitive and normalizes input", () => {
    const input = "hallo @búddy"; // two d's, with diacritic
    // @ts-ignore: access private for debug
    const mentionNames = service["mentionNames"];
    // @ts-ignore: access private for debug
    const normalizeFn =
      service.constructor.prototype.__proto__.normalize || ((x: string) => x);
    const normalizedInput = input
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/\s+/g, " ")
      .trim();
    console.log("Normalized input:", normalizedInput);
    console.log("Mention names:", mentionNames);
    expect(service.isMentioned("Hi @streambuddy")).toBe(true);
    expect(service.isMentioned("HI @BUDDY")).toBe(true);
    expect(service.isMentioned("hI @Sb")).toBe(true);
    expect(service.isMentioned(input)).toBe(true); // diacritics
  });

  it("returns false if no mention is present", () => {
    expect(service.isMentioned("hello world")).toBe(false);
    expect(service.isMentioned("no bot here")).toBe(false);
  });

  it("supports custom mention names", () => {
    service.setMentionNames(["@custom", "@temanku"]);
    expect(service.isMentioned("halo @custom")).toBe(true);
    expect(service.isMentioned("hai @temanku")).toBe(true);
    expect(service.isMentioned("hi @buddy")).toBe(false);
  });
});
