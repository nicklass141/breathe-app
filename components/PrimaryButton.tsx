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
    "bg-[#cfdcb6] text-[#07100d] shadow-[0_18px_45px_rgba(166,190,139,0.18)] hover:bg-[#e0e9cb]",
  secondary:
    "border border-white/10 bg-[#16241d] text-[#f7f0df] hover:bg-[#1d2f25]",
  ghost: "bg-transparent text-[#9eaa9a] hover:bg-white/5 hover:text-[#f7f0df]",
};

export function PrimaryButton({
  children,
  disabled = false,
  href,
  onClick,
  type = "button",
  variant = "primary",
}: PrimaryButtonProps) {
  const className = `inline-flex min-h-14 w-full items-center justify-center rounded-[1.75rem] px-6 text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#dbe8c6] focus:ring-offset-2 focus:ring-offset-[#07100d] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]}`;

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
