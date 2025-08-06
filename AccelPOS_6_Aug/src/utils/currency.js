// Utility functions for formatting and parsing currency with 'Rs.' prefix

export function formatWithRs(value) {
  if (value === "" || value == null) return "";
  return `Rs. ${value}`;
}

export function parseRs(value) {
  // Remove anything that's not a digit
  return value.replace(/[^\d]/g, "");
}
