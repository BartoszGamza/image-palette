export default function topColorsByHistogram ({ chunkedArray, nBlocks, nTop }) {
  let blocks = populateBlocksWithPixels(chunkedArray, nBlocks)
  let topBlocks = sortBlocks(blocks, nTop)

  return getBlockColors(blocks, topBlocks)
}

const getPixelsCoordinates = (pixel, nBlocks) => {
  const bucketSize = 255 / nBlocks

  const redAxis = Math.floor(pixel[0] / bucketSize)
  const greenAxis = Math.floor(pixel[1] / bucketSize)
  const blueAxis = Math.floor(pixel[2] / bucketSize)

  return `${redAxis}:${greenAxis}:${blueAxis}:`
}

const populateBlocksWithPixels = (pixelArray, nBlocks) => {
  let blocksMap = {}
  pixelArray.forEach(pixel => {
    const pixelsBlock = getPixelsCoordinates(pixel, nBlocks)
    if (blocksMap[pixelsBlock]) {
      blocksMap[pixelsBlock].push(pixel)
    } else {
      blocksMap[pixelsBlock] = [pixel]
    }
  })
  return blocksMap
}

const sortBlocks = (blocksMap, nTop) => {
  return Object.keys(blocksMap).sort((a, b) => { return blocksMap[b].length - blocksMap[a].length }).slice(0, nTop)
}

const getBlockColors = (blocksMap, topTenBlocks) => {
  return topTenBlocks.map(block => {
    return getAverageBlockColor(blocksMap[block])
  })
}

const getAverageBlockColor = (block) => {
  let totalArray = [0, 0, 0]
  block.forEach(pixel => {
    for (let i = 0; i < 3; i++) {
      totalArray[i] += pixel[i]
    }
  })
  return totalArray.map(color => Math.floor(color / block.length))
}
