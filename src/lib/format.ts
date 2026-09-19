export function formatPrice(amount: number): string {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${grouped}đ`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;

  return `${km.toFixed(1).replace('.', ',')}km`;
}

export function formatDiscount(price: number, originalPrice: number): string | null {
  if (originalPrice <= 0 || price >= originalPrice) return null;

  return `-${Math.round((1 - price / originalPrice) * 100)}%`;
}

export function formatRadius(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;

  return `${km}km`;
}
