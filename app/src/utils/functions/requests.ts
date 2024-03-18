export function objToQuery<K extends string|number|symbol,T>(obj:Record<K,T> | undefined) {
  if (!obj || typeof obj !== "object") return "";
  let queryString = "";
  Object.entries(obj).forEach(([key, val], i) => {
    if (val !== null && val !== undefined) {
      queryString += i == 0 ? "?" : "&";
      queryString += `${key}=${encodeURIComponent(String(val))}`;
    }
  });
  return queryString;
};

export function objToFormData<K extends string|number|symbol,T>(obj:Record<K,T>) {
  let bodyData = new FormData();
  Object.entries(obj).forEach(([key, val]) => {
    if (Array.isArray(val)) bodyData.append(key, JSON.stringify(val));
    else bodyData.append(key, val as any);
  });
  return bodyData;
};