// "Purchase type" options: ready to ship, or made to the customer's size. Stores spell the
// option and its values many ways ("PURCHASE TYPE", "CUSTOM MADE IN 14 DAYS"), so they're read loosely.

export const isPurchaseOption = (name: string) => /\bp?urchase\s*type\b|\bfulfil/i.test(name);

export type PurchaseKind = "ready" | "made" | "other";

export function purchaseKind(value: string): PurchaseKind {
  if (/ready/i.test(value)) return "ready";
  if (/made|custom|bespoke|tailor/i.test(value)) return "made";
  return "other";
}

/** How many days making takes, from a value like "Custom made in 14 days"; 14 when it doesn't say. */
export function makeDays(value: string) {
  const days = value.match(/(\d+)\s*(?:working\s*)?days?/i);
  return days ? Number(days[1]) : 14;
}

/** "CHOOSE ITEM" → "Choose item": shouty option names and values in sentence case. */
export function sentenceCase(text: string) {
  const t = text.trim();
  return /[A-Z]{3}/.test(t) && t === t.toUpperCase() ? t.charAt(0) + t.slice(1).toLowerCase() : t;
}

export type DeliveryPlan = {
  /** "Dispatched next working day" */
  dispatchLine: string;
  dispatchDays: number | null;
  ukDays: number | null;
  /** "14:00": orders after this leave a working day later. */
  cutoff: string | null;
  holidays: string[];
};

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function addWorkingDays(from: Date, days: number, holidays: string[]) {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6 && !holidays.includes(ymd(d))) left--;
  }
  return d;
}

const shortDate = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).replace(",", "");

/** When an order placed now should arrive in the UK, as "Wed 22 Oct"; null without delivery rules. */
export function arrivalDate(kind: PurchaseKind, value: string, plan: DeliveryPlan, now = new Date()) {
  if (plan.dispatchDays === null || plan.ukDays === null) return null;
  const [h, m] = (plan.cutoff ?? "").split(":").map(Number);
  const late = Number.isFinite(h) && now.getHours() * 60 + now.getMinutes() >= h * 60 + (m || 0);
  let start = now;
  if (kind === "made") {
    start = new Date(now);
    start.setDate(start.getDate() + makeDays(value));
  }
  const dispatched = addWorkingDays(start, plan.dispatchDays + (late && kind !== "made" ? 1 : 0), plan.holidays);
  return shortDate(addWorkingDays(dispatched, plan.ukDays, plan.holidays));
}
