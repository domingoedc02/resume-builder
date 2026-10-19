import { describe, expect, it } from "vitest";
import { toTemplateModel } from "./mapping";
import { defaultLayout, emptyContent } from "./schema";

function fixture() {
  const content = emptyContent();
  content.contact.fullName = "Riley Chen";
  content.contact.links = [
    { id: "l1", label: "Site", url: "https://riley.dev" },
    { id: "l2", label: "Empty", url: "  " },
  ];
  content.summary = "Product-minded engineer.";
  content.experience = [
    {
      id: "e1",
      role: "Engineer",
      company: "Northstar",
      location: "",
      startDate: "2022",
      endDate: "",
      current: true,
      bullets: ["Built tools", "  "],
    },
    {
      id: "e2",
      role: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: true,
      bullets: [],
    },
  ];
  content.skills = [{ id: "s1", group: "", items: "TypeScript" }];
  const layout = defaultLayout();
  layout.order = [
    "skills",
    "summary",
    "experience",
    "education",
    "projects",
    "certifications",
  ];
  layout.hidden = ["summary"];
  return { content, layout };
}

describe("toTemplateModel", () => {
  it("keeps layout order, omits hidden and empty sections", () => {
    const model = toTemplateModel(fixture());
    expect(model.sections.map((s) => s.key)).toEqual(["skills", "experience"]);
    expect(model.contact.fullName).toBe("Riley Chen");
  });

  it("includes a section once it is unhidden", () => {
    const resume = fixture();
    resume.layout.hidden = [];
    expect(toTemplateModel(resume).sections.map((s) => s.key)).toEqual([
      "skills",
      "summary",
      "experience",
    ]);
  });

  it("drops blank items and blank bullets, keeps populated ones", () => {
    const experience = toTemplateModel(fixture()).sections.find(
      (s) => s.key === "experience",
    );
    expect(experience?.key === "experience" && experience.items).toEqual([
      expect.objectContaining({ id: "e1", bullets: ["Built tools"] }),
    ]);
  });

  it("drops links without a url", () => {
    expect(toTemplateModel(fixture()).contact.links.map((l) => l.id)).toEqual([
      "l1",
    ]);
  });

  it("returns no sections for empty content", () => {
    const model = toTemplateModel({
      content: emptyContent(),
      layout: defaultLayout(),
    });
    expect(model.sections).toEqual([]);
  });
});
