import { formatDistanceToNow } from "date-fns";

export function formatCamelCaseString(inputString: string) {
  const words = inputString.split(/(?=[A-Z])/);
  const formattedString = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return formattedString;
}

export function formatTitleCaseString(inputString: string) {
  return inputString
    .split(/[-_]/) // Split on hyphens or underscores
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
    .join(" ");
}

export function getInitials(name: string | undefined) {
  let initials = "";
  const nameArray = name?.split(" ");

  nameArray?.forEach((word) => {
    if (initials.length < 2) {
      initials += word.charAt(0).toUpperCase();
    }
  });

  if (initials.length === 2) {
    return initials;
  } else {
    return `${name?.charAt(0).toUpperCase()}${name?.charAt(1).toUpperCase()}`;
  }
}

export function formatAmount(
  amount: number | undefined | null,
  precision?: number
) {
  if (amount) {
    if (precision !== undefined) {
      // Check if precision is specified
      return amount
        .toFixed(precision) // Convert the number to a string with fixed number of decimal places
        .toString() // Convert to string
        .replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Add commas as thousands separators
    }

    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Add commas as thousands separators
  }

  return "0"; // If amount is null or undefined, return "0"
}

export function getDateOnly(originalDate: Date) {
  return new Date(
    originalDate.getFullYear(),
    originalDate.getMonth(),
    originalDate.getDate()
  );
}

export function getNotiTime(sendDate: Date) {
  return formatDistanceToNow(sendDate, {
    addSuffix: true,
  });
}
