export function formatAddress(address) {
  if (!address) return 'Connect Wallet';
  
  let addressString = '';
  if (typeof address === 'string') {
    addressString = address;
  } else if (address && typeof address.toString === 'function') {
    try {
      addressString = address.toString();
      // Handle the case where toString() returns [object Object]
      if (addressString === '[object Object]') {
        return 'Connect Wallet';
      }
    } catch {
      return 'Connect Wallet';
    }
  }

  if (!addressString || addressString === 'undefined' || addressString === 'null') {
    return 'Connect Wallet';
  }

  if (addressString.length < 10) return addressString;
  return `${addressString.slice(0, 6)}...${addressString.slice(-4)}`;
}
