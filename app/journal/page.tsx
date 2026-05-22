import { AppShell } from "@/components/AppShell";
import { ReflectionForm } from "@/components/ReflectionForm";

export default function JournalPage() {
  return (
    <AppShell activeTab="journal">
      <ReflectionForm
        mode="standalone"
        subtitle="Write a few thoughts before or after your breathing practice."
        title="Daily reflection"
      />
    </AppShell>
  );
}
