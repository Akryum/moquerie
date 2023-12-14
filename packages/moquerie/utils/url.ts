export function isProbablyAnImage(url: string) {
  return url.match(/\.(png|jpe?g|gif|svg|webp)$/) || url.includes('avatar')
}
