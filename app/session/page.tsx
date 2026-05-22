import { AppShell } from "@/components/AppShell";
import { BreathingSessionExperience } from "@/components/BreathingSessionExperience";

export default function BreathingSessionPage() {
  return (
    <AppShell activeTab="breathe">
      <BreathingSessionExperience />
    </AppShell>
  );
}
