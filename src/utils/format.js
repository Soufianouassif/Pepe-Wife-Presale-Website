export const formatAddress = (addr, start = 4, end = 4) => {
  // Ultra-strict safety check for any non-string or null/undefined
  if (!addr || typeof addr !== 'string') {
    return '...';
  }
  
  // Ensure we have enough length to slice
  const safeStart = Math.min(start, addr.length);
  const safeEnd = Math.min(end, addr.length);
  
  if (addr.length < (safeStart + safeEnd)) {
    return addr; // If too short, just return the address as is
  }
  
  try {
    return `${addr.slice(0, safeStart)}...${addr.slice(-safeEnd)}`;
  } catch (e) {
    return '...';
  }
};
