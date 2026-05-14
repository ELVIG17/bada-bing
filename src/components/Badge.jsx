import React from "react";

export default function Badge({ status }) {
  let cls = "badge";
  if (status === "Подтверждена") cls += " ok";
  if (status === "Отклонена") cls += " no";
  return <span className={cls}>{status}</span>;
}