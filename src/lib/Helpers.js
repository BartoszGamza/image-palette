export function chunkArray (arr, size, offset) {
  let results = []
  for (let i = 0; i < arr.length; i += size) {
    results.push(arr.slice(i, i + (size - offset)))
  }
  return results
}

export function RGBtoHex (rgbArray) {
  return rgbArray.reduce((str, c) => {
    let hex = c.toString(16)
    if (hex.length < 2) hex = `0${hex}`
    str.push(hex)
    return str
  }, ['#']).join('')
}
