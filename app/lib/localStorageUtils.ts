const setCache = (key: string, value: unknown, ttl: number) => {
  const now = new Date();
  const item = {
    value,
    expiry: now.getTime() + ttl, // Store expiry time in milliseconds
  };
  localStorage.setItem(key, JSON.stringify(item));
};

const getCache = (key: string) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date();

  // If the item is expired, remove it from storage and return null
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
};

const clearCache = (key: string) => {
  localStorage.removeItem(key);
};

const clearAllCache = () => {
  localStorage.clear();
};

export { setCache, getCache, clearCache, clearAllCache };
