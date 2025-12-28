import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <span className="text-lg font-semibold text-white tracking-tight">
            dec31
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="px-3 py-1.5 text-sm bg-white text-black hover:bg-zinc-200 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-12 max-w-xl">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Who are you becoming on Dec 31, 2026?
            </h1>
            <p className="text-zinc-500 text-sm">
              The infrastructure for human behavior.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-zinc-400 text-xs uppercase tracking-wide">
              One daily question
            </p>
            <p className="text-xl text-white font-medium">
              Closer or further?
            </p>
          </div>

          <Link
            href="/auth/signup"
            className="inline-block px-6 py-3 text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-colors"
          >
            Begin
          </Link>
        </div>
      </main>
    </div>
  );
}
