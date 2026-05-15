import React from "react";

export default function Button({
  variant = "secondary", // primary | secondary | danger | ghost
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