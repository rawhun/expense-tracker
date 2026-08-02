import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === "string" && error) return error
  return fallback
}

export const DEFAULT_CURRENCY = "INR"

const CURRENCY_META: Record<string, { symbol: string; locale: string }> = {
  INR: { symbol: "₹", locale: "en-IN" },
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "en-IE" },
  GBP: { symbol: "£", locale: "en-GB" },
}

export function currencySymbol(currency = DEFAULT_CURRENCY) {
  return (CURRENCY_META[currency] || CURRENCY_META.INR).symbol
}

export function formatMoney(amount: number, currency = DEFAULT_CURRENCY) {
  const meta = CURRENCY_META[currency] || CURRENCY_META.INR
  return `${meta.symbol}${Number(amount).toLocaleString(meta.locale)}`
}
