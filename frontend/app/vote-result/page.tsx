"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Suspense } from "react";

function VoteResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const message = searchParams.get("message");

  const getContent = () => {
    switch (status) {
      case "success":
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: "Vote recorded!",
          description:
            message === "closer"
              ? "You felt closer to your Dec 31 identity today."
              : "You felt further from your Dec 31 identity today.",
          color: message === "closer" ? "text-green-500" : "text-red-500",
        };
      case "already_voted":
        return {
          icon: <AlertCircle className="h-16 w-16 text-orange-500" />,
          title: "Already voted",
          description: message || "You've already voted for this day.",
          color: "text-orange-500",
        };
      case "expired":
        return {
          icon: <Clock className="h-16 w-16 text-zinc-500" />,
          title: "Link expired",
          description: "This voting link has expired. Please vote from your dashboard.",
          color: "text-zinc-500",
        };
      default:
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: "Something went wrong",
          description: message || "An error occurred while recording your vote.",
          color: "text-red-500",
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">{content.icon}</div>
        <h1 className={`text-2xl font-semibold ${content.color}`}>{content.title}</h1>
        <p className="text-zinc-400">{content.description}</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

export default function VoteResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
        </div>
      }
    >
      <VoteResultContent />
    </Suspense>
  );
}
