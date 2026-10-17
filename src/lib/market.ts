import { cookies } from "next/headers";
import { getMarkets } from "@/lib/shopify";

export const COUNTRY_COOKIE = "country";

/** The shopper's chosen country, if it is one the store sells to. */
export async function getCountry(): Promise<string | undefined> {
  const value = (await cookies()).get(COUNTRY_COOKIE)?.value;
  if (!value || !/^[A-Z]{2}$/.test(value)) return undefined;
  const { countries } = await getMarkets();
  return countries.some((c) => c.isoCode === value) ? value : undefined;
}
