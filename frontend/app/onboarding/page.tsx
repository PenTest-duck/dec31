"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Step = 0 | 1;

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("name, identity_statement, onboarding_completed")
          .eq("id", user.id)
          .single();

        if (profile?.onboarding_completed) {
          router.push("/dashboard");
          return;
        }

        if (profile?.name) {
          setName(profile.name);
        } else if (user.user_metadata?.full_name) {
          setName(user.user_metadata.full_name.split(" ")[0]);
        }

        if (profile?.identity_statement) {
          setIdentity(profile.identity_statement);
        }
      }

      setIsLoading(false);
    }

    loadUser();
  }, [supabase, router]);

  useEffect(() => {
    if (step === 1 && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [step, timeRemaining]);

  const handleNext = async () => {
    if (step === 0 && name.trim()) {
      setIsSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("users").update({ name: name.trim() }).eq("id", user.id);
      }

      setIsSaving(false);
      setTimeRemaining(60);
      setStep(1);
    }
  };

  const handleComplete = async () => {
    if (identity.trim()) {
      setIsSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("users")
          .update({
            identity_statement: identity.trim(),
            onboarding_completed: true,
          })
          .eq("id", user.id);
      }

      router.push("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-4 w-4 animate-spin border border-zinc-700 border-t-white" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm space-y-6">
        {step === 0 && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wide">1 of 2</p>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                How should I call you?
              </h1>
            </div>

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-10 text-sm bg-zinc-900 border-zinc-800 text-white"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
            />

            <button
              onClick={handleNext}
              disabled={!name.trim() || isSaving}
              className="w-full h-10 text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Continue"}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wide">2 of 2</p>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                Describe who you are on Dec 31, 2026.
              </h1>
              <p className="text-xs text-zinc-500">
                Write in present tense. Be specific.
              </p>
              {timeRemaining > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="h-1.5 w-1.5 bg-orange-500 animate-pulse" />
                  <p className="text-xs font-medium text-orange-400">
                    Take your time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              )}
            </div>

            <Textarea
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="I am someone who..."
              className="min-h-[120px] text-sm resize-none bg-zinc-900 border-zinc-800 text-white"
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={() => setStep(0)}
                className="h-10 px-4 text-sm border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!identity.trim() || isSaving || timeRemaining > 0}
                className="flex-1 h-10 text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : timeRemaining > 0 ? `Wait ${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}` : "Begin"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
