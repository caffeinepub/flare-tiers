/**
 * Utility functions for parsing and managing URL parameters
 * Works with both hash-based and browser-based routing
 */

export function getUrlParameter(paramName: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const regularParam = urlParams.get(paramName);
  if (regularParam !== null) return regularParam;

  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return null;

  const hashContent = hash.substring(1);
  const queryStartIndex = hashContent.indexOf("?");

  if (queryStartIndex !== -1) {
    const hashQuery = hashContent.substring(queryStartIndex + 1);
    return new URLSearchParams(hashQuery).get(paramName);
  }

  return new URLSearchParams(hashContent).get(paramName);
}

export function storeSessionParameter(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {}
}

export function getSessionParameter(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getPersistedUrlParameter(
  paramName: string,
  storageKey?: string,
): string | null {
  const key = storageKey || paramName;
  const urlValue = getUrlParameter(paramName);
  if (urlValue !== null) {
    storeSessionParameter(key, urlValue);
    return urlValue;
  }
  return getSessionParameter(key);
}

function clearParamFromHash(paramName: string): void {
  if (!window.history.replaceState) return;
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return;
  const hashContent = hash.substring(1);
  const queryStartIndex = hashContent.indexOf("?");
  if (queryStartIndex === -1) return;
  const routePath = hashContent.substring(0, queryStartIndex);
  const queryString = hashContent.substring(queryStartIndex + 1);
  const params = new URLSearchParams(queryString);
  params.delete(paramName);
  const newQueryString = params.toString();
  const newHash = routePath + (newQueryString ? `?${newQueryString}` : "");
  const newUrl =
    window.location.pathname +
    window.location.search +
    (newHash ? `#${newHash}` : "");
  window.history.replaceState(null, "", newUrl);
}

/**
 * Gets a secret parameter from URL with sessionStorage fallback.
 * Works with TanStack Router hash format: #/admin/dashboard?caffeineAdminToken=xxx
 */
export function getSecretParameter(paramName: string): string | null {
  const cached = getSessionParameter(paramName);
  if (cached !== null) return cached;

  const value = getUrlParameter(paramName);
  if (value !== null) {
    storeSessionParameter(paramName, value);
    clearParamFromHash(paramName);
    return value;
  }

  return null;
}

export function clearSessionParameter(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {}
}
