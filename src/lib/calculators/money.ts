export function parseMoney(raw: string) {
  const digits = raw.replace(/[^0-9.]/g, "");
  return parseFloat(digits) || 0;
}

export function formatMoneyInput(raw: string) {
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits === "") return "";
  return parseInt(digits, 10).toLocaleString("en-US");
}
