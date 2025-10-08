// Utility helpers to normalize and resolve image URLs coming from the backend
export const getApiBase = () => {
  // Allow VITE_API_BASE_URL to be either the API root (http://host:port)
  // or the API path (http://host:port/api). If it contains a trailing '/api',
  // strip the '/api' so that image resolution (which expects files under
  // '/uploads/...') points to the host root (http://host:port/uploads/...).
  let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  try {
    // Remove trailing slash
    base = base.replace(/\/$/, '');
    // If someone configured the env var with an '/api' suffix, remove it
    base = base.replace(/\/api\/?$/i, '');
  } catch (e) {
    // noop - fall back to default
  }
  return base;
};

export const resolveImageUrl = (entry: any) => {
  const base = getApiBase();
  if (!entry) return '/images/CleanWater.jpg';

  // If this is already a full URL
  if (typeof entry === 'string') {
    if (entry.startsWith('http')) return entry;
    return entry.startsWith('/') ? `${base}${entry}` : `${base}/${entry}`;
  }

  // If it's an object with `url` property
  if (typeof entry === 'object' && entry.url) {
    const url = entry.url;
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
  }

  return '/images/CleanWater.jpg';
};

// Convenience: resolve primary image for a campaign-like object
export const resolveCampaignImageUrl = (campaign: any) => {
  if (!campaign) return '/images/CleanWater.jpg';
  const imgEntry = (campaign.images && campaign.images.length > 0) ? campaign.images[0] : campaign.primaryImage ? campaign.primaryImage : null;
  return resolveImageUrl(imgEntry);
};
