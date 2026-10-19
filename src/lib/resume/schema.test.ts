import { describe, expect, it } from "vitest";
import {
  ResumeTooLargeError,
  SECTION_KEYS,
  defaultLayout,
  emptyContent,
  parseContent,
  parseLayout,
  serializeContent,
  serializeLayout,
} from "./schema";

describe("resume schema", () => {
  it("round-trips empty content", () => {
    const content = emptyContent();
    expect(parseContent(serializeContent(content))).toEqual(content);
  });

  it("fills defaults for missing fields", () => {
    const content = parseContent(JSON.stringify({ summary: "Hi" }));
    expect(content.summary).toBe("Hi");
    expect(content.contact.links).toEqual([]);
    expect(content.experience).toEqual([]);
  });

  it("rejects malformed JSON and bad shapes", () => {
    expect(() => parseContent("{nope")).toThrow();
    expect(() =>
      parseContent(JSON.stringify({ experience: [{ role: "x" }] })),
    ).toThrow();
  });

  it("rejects content over the size cap", () => {
    const content = emptyContent();
    content.experience = Array.from({ length: 20 }, (_, i) => ({
      id: `e${i}`,
      role: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: Array.from({ length: 30 }, () => "a".repeat(1000)),
    }));
    expect(() => serializeContent(content)).toThrow(ResumeTooLargeError);
  });

  it("normalizes layout: dedupes and appends missing sections", () => {
    const layout = parseLayout(
      JSON.stringify({ order: ["skills", "skills", "summary"], hidden: [] }),
    );
    expect(layout.order.slice(0, 2)).toEqual(["skills", "summary"]);
    expect([...layout.order].sort()).toEqual([...SECTION_KEYS].sort());
    expect(parseLayout(serializeLayout(defaultLayout()))).toEqual(
      defaultLayout(),
    );
  });
});
