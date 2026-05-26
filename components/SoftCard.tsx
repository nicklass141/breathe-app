type SoftCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function SoftCard({ children, className = "" }: SoftCardProps) {
  return (
    <section
      className={`rounded-[2rem] border border-white/8 bg-[#111111] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.3)] ${className}`}
    >
      {children}
    </section>
  );
}
