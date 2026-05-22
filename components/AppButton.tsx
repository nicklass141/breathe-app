import Link from "next/link";

type AppButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
};

const baseStyles =
  "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2";

const variants = {
  primary: "bg-teal-700 text-white hover:bg-teal-800",
  secondary:
    "border border-teal-200 bg-white text-teal-900 hover:border-teal-300 hover:bg-teal-50",
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
