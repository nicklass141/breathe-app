import { AppShell } from "@/components/AppShell";
import { AuthForm } from "@/components/AuthForm";

export default function AuthPage() {
  return (
    <AppShell activeTab="breathe">
      <AuthForm />
    </AppShell>
  );
}
