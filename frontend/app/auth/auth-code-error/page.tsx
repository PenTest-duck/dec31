import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          Authentication Error
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Something went wrong during sign in. Please try again.
        </p>
        <Button asChild>
          <Link href="/auth/login">Back to login</Link>
        </Button>
      </div>
    </div>
  );
}
