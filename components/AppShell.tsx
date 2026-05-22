import Link from "next/link";
import { SettingsMenu } from "@/components/SettingsMenu";

type AppShellProps = {
  activeTab?: "breathe" | "journal" | "history";
  children: React.ReactNode;
};

const navItems = [
  { href: "/", label: "Breathe", value: "breathe" },
  { href: "/journal", label: "Journal", value: "journal" },
  { href: "/history", label: "History", value: "history" },
] as const;

export function AppShell({ activeTab = "breathe", children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#07100d] text-[#f5efe2]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[radial-gradient(circle_at_top,#172820_0%,#07100d_42%,#050807_100%)] px-5">
        <header className="flex items-center justify-between pb-6 pt-7">
          <Link
            className="text-3xl font-semibold tracking-[-0.02em] text-[#f8f1e3]"
            href="/"
          >
            breathe.
          </Link>
          <SettingsMenu />
        </header>

        <main className="flex flex-1 flex-col pb-28">{children}</main>

        <BottomNav activeTab={activeTab} />
      </div>
    </div>
  );
}

function BottomNav({ activeTab }: { activeTab: AppShellProps["activeTab"] }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md px-5 pb-5">
      <div className="grid grid-cols-3 rounded-[2rem] border border-white/8 bg-[#101a15]/90 p-2 shadow-[0_-18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        {navItems.map((item) => {
          const isActive = item.value === activeTab;

          return (
            <Link
              className={`flex min-h-14 items-center justify-center rounded-[1.5rem] text-sm font-semibold transition ${
                isActive
                  ? "bg-[#dbe8c6] text-[#0a120f] shadow-[0_10px_30px_rgba(219,232,198,0.16)]"
                  : "text-[#8c9d90] hover:bg-white/5 hover:text-[#f5efe2]"
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
