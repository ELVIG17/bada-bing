import "./styles/Button.css";

export default function Button({
  variant = "secondary",
  type = "button",
  onClick,
  disabled,
  children,
  className = "",
}) {
  const cls = ["btn", `btn-${variant}`, className].join(" ").trim();

  return (
    <button className={cls} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}