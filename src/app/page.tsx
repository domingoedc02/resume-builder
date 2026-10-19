import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const sampleResume = {
  name: "Mara Ellis",
  role: "Product designer",
  email: "mara.ellis@example.com",
  phone: "+1 415 555 0182",
  location: "Brooklyn, NY",
  summary:
    "Product designer with 8 years of experience turning complex workflows into clear, useful software. Most recently, I led design for a scheduling product used by independent clinics.",
  experience: [
    {
      role: "Senior Product Designer",
      company: "Northline Health",
      date: "2021 — Present",
      bullets: [
        "Redesigned appointment booking across web and mobile, reducing median completion time from 4 minutes to 90 seconds.",
        "Partnered with 6 engineers and 2 researchers to ship a shared component library used across 3 product teams.",
      ],
    },
    {
      role: "Product Designer",
      company: "Fieldwork Studio",
      date: "2018 — 2021",
      bullets: [
        "Mapped onboarding across 12 customer interviews and removed 3 steps from the first-run experience.",
        "Worked with product and engineering to turn a legacy reporting tool into a responsive dashboard.",
      ],
    },
  ],
  education: "BFA, Communication Design · California College of the Arts",
  skills: "Product strategy, prototyping, Figma, user research, design systems",
};

export default function Home() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-10">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight"
          aria-label="Folio home"
        >
          folio<span className="text-muted-foreground">.</span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground hidden rounded-md px-3 py-2 text-sm transition-colors sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={buttonVariants({
              size: "sm",
              className: "rounded-md px-4",
            })}
          >
            Start a resume
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-14 px-5 pt-12 pb-20 sm:px-10 sm:pt-20 sm:pb-28 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-20">
        <div className="max-w-xl">
          <p className="text-muted-foreground mb-6 font-mono text-[11px] tracking-[0.18em] uppercase">
            Resume writing, without the noise
          </p>
          <h1 className="max-w-lg font-serif text-5xl leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-[4.5rem]">
            Make your next move read clearly.
          </h1>
          <p className="text-muted-foreground mt-7 max-w-md text-base leading-7 sm:text-lg sm:leading-8">
            Write a focused resume, shape it to your experience, and export a
            clean document that keeps the attention on your work.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className={buttonVariants({ className: "h-11 rounded-md px-5" })}
            >
              Build your resume
            </Link>
            <a
              href="#preview"
              className="text-muted-foreground hover:text-foreground focus-visible:outline-ring inline-flex h-11 items-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              See the format
            </a>
          </div>
          <p className="text-muted-foreground mt-5 text-xs">
            Four readable templates. Your details stay yours.
          </p>
        </div>

        <div
          id="preview"
          className="relative mx-auto w-full max-w-[620px] scroll-mt-8"
        >
          <div
            className="bg-muted/60 absolute -inset-4 -z-10 rounded-xl"
            aria-hidden="true"
          />
          <article
            aria-label="Example resume preview"
            className="border-border bg-card text-card-foreground mx-auto min-h-[540px] max-w-[490px] border px-7 py-8 text-[10px] leading-[1.55] shadow-[0_2px_8px_rgba(0,0,0,0.035)] sm:px-10 sm:py-10"
          >
            <header className="border-border border-b pb-4">
              <h2 className="font-serif text-[27px] leading-tight tracking-tight">
                {sampleResume.name}
              </h2>
              <p className="mt-1 text-[11px] font-medium">
                {sampleResume.role}
              </p>
              <p className="text-muted-foreground mt-2 text-[9px]">
                {sampleResume.email} <span aria-hidden="true">·</span>{" "}
                {sampleResume.phone} <span aria-hidden="true">·</span>{" "}
                {sampleResume.location}
              </p>
            </header>
            <section className="mt-4">
              <h3 className="text-muted-foreground mb-1 font-mono text-[8px] font-medium tracking-[0.15em] uppercase">
                Profile
              </h3>
              <p>{sampleResume.summary}</p>
            </section>
            <section className="mt-4">
              <h3 className="text-muted-foreground mb-2 font-mono text-[8px] font-medium tracking-[0.15em] uppercase">
                Experience
              </h3>
              <div className="space-y-3">
                {sampleResume.experience.map((job) => (
                  <div key={job.company}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-semibold">
                        {job.role}{" "}
                        <span className="text-muted-foreground font-normal">
                          · {job.company}
                        </span>
                      </p>
                      <p className="text-muted-foreground shrink-0">
                        {job.date}
                      </p>
                    </div>
                    <ul className="mt-1 list-disc space-y-0.5 pl-3">
                      {job.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
            <section className="mt-4">
              <h3 className="text-muted-foreground mb-1 font-mono text-[8px] font-medium tracking-[0.15em] uppercase">
                Education
              </h3>
              <p>{sampleResume.education}</p>
            </section>
            <section className="mt-4">
              <h3 className="text-muted-foreground mb-1 font-mono text-[8px] font-medium tracking-[0.15em] uppercase">
                Skills
              </h3>
              <p>{sampleResume.skills}</p>
            </section>
          </article>
          <div className="border-border bg-card text-muted-foreground absolute -bottom-4 -left-4 border px-4 py-3 text-xs sm:-left-8">
            <span className="font-mono text-[10px] tracking-wider uppercase">
              01
            </span>
            <span className="ml-3">A clear format, built around your work</span>
          </div>
        </div>
      </section>

      <section className="border-border bg-muted/25 border-t">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-10 sm:py-16 md:grid-cols-3 md:gap-8">
          <div>
            <p className="text-muted-foreground font-mono text-[10px] tracking-[0.16em] uppercase">
              01 / Write
            </p>
            <h2 className="mt-3 font-serif text-2xl tracking-tight">
              Your experience, in your words.
            </h2>
            <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-6">
              Add the details that matter. Reorder sections and save as you go.
            </p>
          </div>
          <div>
            <p className="text-muted-foreground font-mono text-[10px] tracking-[0.16em] uppercase">
              02 / Refine
            </p>
            <h2 className="mt-3 font-serif text-2xl tracking-tight">
              Improve a line. Keep the facts.
            </h2>
            <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-6">
              Review optional writing suggestions individually before anything
              changes.
            </p>
          </div>
          <div>
            <p className="text-muted-foreground font-mono text-[10px] tracking-[0.16em] uppercase">
              03 / Export
            </p>
            <h2 className="mt-3 font-serif text-2xl tracking-tight">
              A document that travels well.
            </h2>
            <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-6">
              Choose A4 or Letter, then save a selectable-text PDF from your
              browser.
            </p>
          </div>
        </div>
      </section>

      <footer className="text-muted-foreground mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-7 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p className="text-foreground font-serif text-base font-semibold">
          folio.
        </p>
        <p>Built for clear, considered applications.</p>
      </footer>
    </main>
  );
}
