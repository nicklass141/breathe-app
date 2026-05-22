import { AppShell } from "@/components/AppShell";
import { HistoryArchive } from "@/components/HistoryArchive";

export default function HistoryPage() {
  return (
    <AppShell activeTab="history">
      <HistoryArchive />
    </AppShell>
  );
}
