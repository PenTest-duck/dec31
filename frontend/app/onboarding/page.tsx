"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
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
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-black dark:border-zinc-700 dark:border-t-white" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black px-4">
      <div className="w-full max-w-md space-y-8">
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="space-y-2">
              <p className="text-sm text-zinc-500 dark:text-zinc-500">1 of 2</p>
              <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
                How should I call you?
              </h1>
            </div>

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-12 text-lg"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
            />

            <Button
              onClick={handleNext}
              disabled={!name.trim() || isSaving}
              className="w-full h-12 text-base font-medium"
            >
              {isSaving ? "Saving..." : "Continue"}
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="space-y-2">
              <p className="text-sm text-zinc-500 dark:text-zinc-500">2 of 2</p>
              <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
                Describe who you are on Dec 31, 2026.
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Write in present tense. Be specific. This is the identity you are becoming.
              </p>
            </div>

            <Textarea
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="I am someone who..."
              className="min-h-[160px] text-base resize-none"
              autoFocus
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(0)}
                className="h-12"
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!identity.trim() || isSaving}
                className="flex-1 h-12 text-base font-medium"
              >
                {isSaving ? "Saving..." : "Begin your transformation"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
