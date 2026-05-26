import { AppShell } from "@/components/AppShell";
import { BreathingSetupForm } from "@/components/BreathingSetupForm";

export default function BreathingSetupPage() {
  return (
    <AppShell activeTab="breathe">
      <BreathingSetupForm />
    </AppShell>
  );
}
