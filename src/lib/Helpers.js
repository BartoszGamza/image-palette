export function chunkArray (arr, size, offset) {
  let results = []
  for (let i = 0; i < arr.length; i += size) {
    results.push(arr.slice(i, i + (size - offset)))
  }
  return results
}
