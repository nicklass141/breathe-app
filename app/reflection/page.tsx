import { AppShell } from "@/components/AppShell";
import { ReflectionForm } from "@/components/ReflectionForm";

export default function ReflectionPage() {
  return (
    <AppShell activeTab="journal">
      <ReflectionForm />
    </AppShell>
  );
}
