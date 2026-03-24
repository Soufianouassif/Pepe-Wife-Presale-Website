export function formatAddress(address) {
  if (!address) return 'Connect Wallet';
  if (typeof address !== 'string') {
    try {
      address = address.toString();
    } catch {
      return 'Connect Wallet';
    }
  }
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
