import Link from "next/link";

type AppButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
};

const baseStyles =
  "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#f2f2ee] focus:ring-offset-2 focus:ring-offset-[#050505]";

const variants = {
  primary: "bg-[#f2f2ee] text-[#050505] hover:bg-white",
  secondary:
    "border border-white/10 bg-[#151515] text-[#f4f4f2] hover:bg-[#1d1d1d]",
};

export function AppButton({
  children,
  href,
  variant = "primary",
  type = "button",
}: AppButtonProps) {
  const className = `${baseStyles} ${variants[variant]}`;

  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} type={type}>
      {children}
    </button>
  );
}
