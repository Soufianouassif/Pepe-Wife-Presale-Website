export const formatAddress = (addr, start = 4, end = 4) => {
  // Critical safety check: if addr is not a string or is too short, return a safe value.
  if (typeof addr !== 'string' || addr.length < (start + end)) {
    return '...'; // Return a placeholder instead of crashing
  }
  return `${addr.slice(0, start)}...${addr.slice(-end)}`;
};
