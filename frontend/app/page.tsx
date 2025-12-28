import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-semibold text-black dark:text-white">
            dec31
          </span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-black dark:text-white leading-tight">
            Design the person,
            <br />
            not the plan.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            An AI-native system for deliberately shaping who you become through
            small, compounding actions—so that who you are on Dec 31 is not
            accidental.
          </p>

          <Button size="lg" className="h-14 px-8 text-lg font-medium" asChild>
            <Link href="/auth/signup">Begin your transformation</Link>
          </Button>
        </div>

        {/* Philosophy */}
        <div className="max-w-4xl mx-auto mt-32 space-y-24">
          <section className="text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white">
              Identity is the root primitive
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Tasks do not matter. Habits do not matter. Goals do not matter.
              <span className="block mt-2 text-black dark:text-white font-medium">
                Identity matters.
              </span>
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Every action is a vote for the type of person you are becoming.
            </p>
          </section>

          <section className="text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white">
              Systems beat willpower
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Humans do not rise to goals. They fall to systems. Motivation is
              unreliable. Willpower is finite. Behavior is predictable.
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              dec31 engineers systems that make the right behavior the default.
            </p>
          </section>

          <section className="text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white">
              Time is the spine
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Dec 31 is not branding. It is the psychological container. You are
              always moving toward Dec 31. Every action is contextualized by:
            </p>
            <p className="text-black dark:text-white font-medium italic">
              &ldquo;Is this consistent with the person who reaches Dec 31?&rdquo;
            </p>
          </section>

          <section className="text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white">
              One daily question
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Each day, you answer one question:
            </p>
            <p className="text-xl text-black dark:text-white font-medium">
              &ldquo;Did you feel closer or further from your Dec 31 identity?&rdquo;
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              No dashboards by default. No analytics obsession. Just signal.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="max-w-xl mx-auto mt-32 text-center space-y-6">
          <p className="text-zinc-600 dark:text-zinc-400">
            This is not a productivity app.
            <br />
            This is behavioral infrastructure.
          </p>
          <Button size="lg" className="h-14 px-8 text-lg font-medium" asChild>
            <Link href="/auth/signup">Begin your transformation</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-zinc-500 dark:text-zinc-500">
          <p>dec31 — Design the person, not the plan.</p>
        </div>
      </footer>
    </div>
  );
}
