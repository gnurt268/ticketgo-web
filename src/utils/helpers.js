import dayjs from "dayjs";
import { DATE_FORMAT } from "./constants";

/**
 * Format date for display
 */
export const formatDate = (date, format = DATE_FORMAT.DISPLAY) => {
  if (!date) return "";
  return dayjs(date).format(format);
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  return formatDate(date, DATE_FORMAT.DISPLAY_WITH_TIME);
};

/**
 * Format currency (VND)
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format number with thousand separator
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date) => {
  return dayjs(date).isBefore(dayjs());
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  return dayjs(date).fromNow();
};

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Get error message from API response
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    return Object.values(error.response.data.errors).flat().join(", ");
  }
  if (error.message) {
    return error.message;
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
};

/**
 * Build query string from object
 */
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};
