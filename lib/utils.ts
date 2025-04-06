import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("AOA", {
    style: "currency",
    currency: "AOA",
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("AOA", {
    year: "numeric",
    month: "long",
    day: "numeric",
     
  }).format(new Date(date))
}

export function formatHour(date: Date): string {
  return new Intl.DateTimeFormat("AOA", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date(date))
}