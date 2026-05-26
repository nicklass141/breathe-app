import Link from "next/link";

type PrimaryButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary:
    "bg-[#f2f2ee] text-[#050505] shadow-[0_18px_45px_rgba(255,255,255,0.11)] hover:bg-white",
  secondary:
    "border border-white/10 bg-[#151515] text-[#f4f4f2] hover:bg-[#1d1d1d]",
  ghost: "bg-transparent text-[#9a9a95] hover:bg-white/5 hover:text-[#f4f4f2]",
};

export function PrimaryButton({
  children,
  disabled = false,
  href,
  onClick,
  type = "button",
  variant = "primary",
}: PrimaryButtonProps) {
  const className = `inline-flex min-h-14 w-full items-center justify-center rounded-[1.75rem] px-6 text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#f2f2ee] focus:ring-offset-2 focus:ring-offset-[#050505] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]}`;

  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
