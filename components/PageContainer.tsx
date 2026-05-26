import Link from "next/link";

type PageContainerProps = {
  children: React.ReactNode;
};

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f4f4f2]">
      <header className="border-b border-white/10 bg-[#111111]/85">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link className="text-base font-semibold text-[#f4f4f2]" href="/">
            StillSpace
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium text-[#9a9a95]">
            <Link className="hover:text-[#f4f4f2]" href="/breathing">
              Breathe
            </Link>
            <Link className="hover:text-[#f4f4f2]" href="/history">
              History
            </Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}
