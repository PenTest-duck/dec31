import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="text-center space-y-4 max-w-xs">
        <h1 className="text-xl font-semibold text-white">
          Authentication Error
        </h1>
        <p className="text-sm text-zinc-500">
          Something went wrong during sign in. Please try again.
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-4 py-2 text-sm bg-white text-black hover:bg-zinc-200 transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
