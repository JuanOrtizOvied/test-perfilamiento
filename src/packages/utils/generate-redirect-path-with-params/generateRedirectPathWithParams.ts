/** Current pathname plus the normalized `?query` suffix (empty when no query). */
function readLocationParts() {
  const url = new URL(window.location.href)
  const params = url.search.slice(1)
  return {
    path: url.pathname,
    paramsString: params ? `?${params}` : '',
  }
}

export const generateRedirectPathWithParams = (): string | null => {
  const { path, paramsString } = readLocationParts()
  return path ? `?redirect=${path}${paramsString}` : null
}

export const generatePathWithParams = (): string | null => {
  const { path, paramsString } = readLocationParts()
  return path ? `${path}${paramsString}` : null
}

export const generateParams = (): string | null => {
  return readLocationParts().paramsString
}
