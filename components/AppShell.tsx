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
    <div className="min-h-screen bg-[#050505] text-[#f4f4f2]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[radial-gradient(circle_at_top,#171717_0%,#080808_42%,#050505_100%)] px-5">
        <header className="flex items-center justify-between pb-3 pt-5">
          <Link
            className="text-2xl font-semibold tracking-[-0.02em] text-[#f4f4f2]"
            href="/"
          >
            breathe.
          </Link>
          <SettingsMenu />
        </header>

        <main className="flex flex-1 flex-col pb-[5.35rem]">{children}</main>

        <BottomNav activeTab={activeTab} />
      </div>
    </div>
  );
}

function BottomNav({ activeTab }: { activeTab: AppShellProps["activeTab"] }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md px-5 pb-[1.125rem]">
      <div className="grid grid-cols-3 rounded-[2rem] border border-white/8 bg-[#111111]/92 p-[0.45rem] shadow-[0_-18px_50px_rgba(0,0,0,0.42)] backdrop-blur">
        {navItems.map((item) => {
          const isActive = item.value === activeTab;

          return (
            <Link
              className={`flex min-h-[3.25rem] items-center justify-center rounded-[1.5rem] text-sm font-semibold transition ${
                isActive
                  ? "bg-[#f2f2ee] text-[#050505] shadow-[0_10px_30px_rgba(255,255,255,0.12)]"
                  : "text-[#8f8f8a] hover:bg-white/6 hover:text-[#f4f4f2]"
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
