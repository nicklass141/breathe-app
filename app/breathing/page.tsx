import { AppShell } from "@/components/AppShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SoftCard } from "@/components/SoftCard";

const sessionTypes = ["Balance", "Box Breathing", "Calm", "Deep Reset"];
const durations = ["1 minute", "2 minutes", "3 minutes"];

export default function BreathingSetupPage() {
  return (
    <AppShell activeTab="breathe">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9daf96]">
            Setup
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#f8f1e3]">
            Shape your session
          </h1>
          <p className="mt-3 text-base leading-7 text-[#8a9a8d]">
            Choose a soft rhythm and a short duration before you begin.
          </p>
        </div>

        <form className="space-y-5">
          <SoftCard>
            <fieldset>
              <legend className="text-sm font-semibold text-[#f5efe2]">
                Breathing style
              </legend>
              <div className="mt-4 grid gap-3">
                {sessionTypes.map((type) => (
                  <label
                    className="flex min-h-14 items-center rounded-[1.5rem] border border-white/8 bg-[#0c1712] px-4 text-sm font-semibold text-[#cdd8c5] has-[:checked]:border-[#cfdcb6] has-[:checked]:bg-[#213427] has-[:checked]:text-[#f8f1e3]"
                    key={type}
                  >
                    <input
                      className="mr-3 accent-[#cfdcb6]"
                      defaultChecked={type === "Balance"}
                      name="session-type"
                      type="radio"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>
          </SoftCard>

          <SoftCard>
            <fieldset>
              <legend className="text-sm font-semibold text-[#f5efe2]">
                Duration
              </legend>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {durations.map((duration) => (
                  <label
                    className="flex min-h-14 items-center justify-center rounded-[1.5rem] border border-white/8 bg-[#0c1712] text-sm font-semibold text-[#8c9d90] has-[:checked]:border-[#cfdcb6] has-[:checked]:bg-[#dbe8c6] has-[:checked]:text-[#07100d]"
                    key={duration}
                  >
                    <input
                      className="sr-only"
                      defaultChecked={duration === "2 minutes"}
                      name="duration"
                      type="radio"
                    />
                    {duration}
                  </label>
                ))}
              </div>
            </fieldset>
          </SoftCard>

          <div className="space-y-3 pt-2">
            <PrimaryButton href="/session">Begin session</PrimaryButton>
            <PrimaryButton href="/" variant="secondary">
              Back to breathe
            </PrimaryButton>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
