import Link from "next/link";

type PageContainerProps = {
  children: React.ReactNode;
};

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <header className="border-b border-teal-100 bg-white/80">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link className="text-base font-semibold text-teal-950" href="/">
            StillSpace
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link className="hover:text-teal-800" href="/breathing">
              Breathe
            </Link>
            <Link className="hover:text-teal-800" href="/history">
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
