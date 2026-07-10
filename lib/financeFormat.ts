const etbCurrency = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const etbCurrencySigned = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});

const ledgerDateTime = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const ledgerDate = new Intl.DateTimeFormat("en-CA");

export function formatEtb(amount: number, currency = "ETB") {
  return `${etbCurrency.format(amount)} ${currency}`;
}

export function formatEtbSigned(amount: number, currency = "ETB") {
  return `${etbCurrencySigned.format(amount)} ${currency}`;
}

export function formatLedgerTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return ledgerDateTime.format(date);
}

export function todayIsoDate() {
  return ledgerDate.format(new Date());
}

export function getInitials(nameOrEmail: string) {
  const base = nameOrEmail.includes("@") ? nameOrEmail.split("@")[0] : nameOrEmail;
  const parts = base.trim().split(/[\s._-]+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
