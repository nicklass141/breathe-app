import { AppShell } from "@/components/AppShell";
import { MainBreathingScreen } from "@/components/MainBreathingScreen";

export default function Home() {
  return (
    <AppShell activeTab="breathe">
      <MainBreathingScreen />
    </AppShell>
  );
}
