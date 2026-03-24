/**
 * Safely formats a wallet address or public key.
 * Prevents runtime crashes from .slice() on undefined/null values.
 * @param {string|object} address - The address or public key to format.
 * @returns {string} - Formatted address (e.g., 0x1234...5678) or fallback text.
 */
export function formatAddress(address) {
  if (!address) return 'Connect Wallet';
  
  let addressString = '';
  
  // Handle different address types safely
  if (typeof address === 'string') {
    addressString = address;
  } else if (address && typeof address.toString === 'function') {
    try {
      addressString = address.toString();
      // Guard against [object Object] which toString() might return
      if (addressString === '[object Object]') {
        return 'Connect Wallet';
      }
    } catch (e) {
      console.error("formatAddress: Error converting address to string", e);
      return 'Connect Wallet';
    }
  }

  // Final check for empty or invalid strings
  if (!addressString || addressString === 'undefined' || addressString === 'null') {
    return 'Connect Wallet';
  }

  // Ensure it's long enough to slice, otherwise return as is
  if (addressString.length < 10) {
    return addressString;
  }

  // Safe slicing
  try {
    const start = addressString.slice(0, 6);
    const end = addressString.slice(-4);
    return `${start}...${end}`;
  } catch (e) {
    console.error("formatAddress: Error slicing address string", e);
    return addressString;
  }
}
