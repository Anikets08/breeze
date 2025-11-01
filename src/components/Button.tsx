import { type ButtonHTMLAttributes, type PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: PropsWithChildren<ButtonProps>) {
  const variantClass =
    variant === "primary"
      ? "option-button"
      : variant === "secondary"
      ? "download-button"
      : "back-button";

  return (
    <button className={`${variantClass}${className ? " " + className : ""}`} {...rest}>
      {children}
    </button>
  );
}


