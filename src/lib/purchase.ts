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

/** A number of working days, or a range such as [2, 4]. */
export type DayRange = [number, number];

export type DeliveryPlan = {
  /** "Dispatched next working day" */
  dispatchLine: string;
  /** Working days before a ready-to-ship piece leaves us. */
  dispatch: DayRange;
  /** Working days from dispatch to a UK door, by standard delivery. */
  uk: DayRange;
  /** "14:00": orders after this leave a working day later. */
  cutoff: string | null;
  holidays: string[];
};

/** "2 to 4" → [2, 4]; "3" → [3, 3]. */
export function dayRange(text: string): DayRange {
  const [min, max = min] = (text.match(/\d+/g) ?? ["0"]).map(Number);
  return [min, max];
}

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

/** "Wed 22 Oct", or "Mon 20 – Thu 23 Oct" / "Fri 31 Oct – Tue 4 Nov" for a range. */
function dateSpan(from: Date, to: Date) {
  if (ymd(from) === ymd(to)) return shortDate(from);
  const day = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }).replace(",", "");
  return from.getMonth() === to.getMonth() ? `${day(from)} – ${shortDate(to)}` : `${shortDate(from)} – ${shortDate(to)}`;
}

/**
 * When an order placed now should arrive in the UK, as "Wed 22 Oct" or a range of dates.
 * Made-to-order pieces are made first (the days in the option's value, else 14), then sent.
 */
export function arrivalDate(kind: PurchaseKind, value: string, plan: DeliveryPlan, now = new Date()) {
  const [h, m] = (plan.cutoff ?? "").split(":").map(Number);
  const late = Number.isFinite(h) && now.getHours() * 60 + now.getMinutes() >= h * 60 + (m || 0);
  let start = now;
  if (kind === "made") {
    start = new Date(now);
    start.setDate(start.getDate() + makeDays(value));
  }
  const extra = late && kind !== "made" ? 1 : 0;
  const arrive = (i: 0 | 1) => addWorkingDays(addWorkingDays(start, plan.dispatch[i] + extra, plan.holidays), plan.uk[i], plan.holidays);
  return dateSpan(arrive(0), arrive(1));
}

/**
 * "Order by 2pm for these dates": only on a working day, before the cutoff set in Shopify, since
 * that's when the dates shown hold. Null otherwise, or when no cutoff is set.
 */
export function cutoffNote(plan: DeliveryPlan, now: Date) {
  const [h, m = 0] = (plan.cutoff ?? "").split(":").map(Number);
  if (!Number.isFinite(h)) return null;
  const working = now.getDay() !== 0 && now.getDay() !== 6 && !plan.holidays.includes(ymd(now));
  if (!working || now.getHours() * 60 + now.getMinutes() >= h * 60 + m) return null;
  const time = `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""}${h < 12 ? "am" : "pm"}`;
  return `Order by ${time} for these dates`;
}

/** The purchase type picked in a bag line's options: ready to ship, made to order, or neither. */
export function lineDelivery(options: { name: string; value: string }[]) {
  const option = options.find((o) => isPurchaseOption(o.name));
  return option ? { kind: purchaseKind(option.value), value: option.value, name: option.name } : null;
}
