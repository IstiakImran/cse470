import { clsx, type ClassValue } from "clsx";
import mongoose from "mongoose";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const comparisonDate = new Date(date);
  const seconds = Math.floor((now.getTime() - comparisonDate.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? `${interval} year ago` : `${interval} years ago`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? `${interval} month ago` : `${interval} months ago`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? `${interval} day ago` : `${interval} days ago`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? `${interval} hour ago` : `${interval} hours ago`;
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1
      ? `${interval} minute ago`
      : `${interval} minutes ago`;
  }

  return seconds < 5 ? "just now" : `${Math.floor(seconds)} seconds ago`;
}

export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
