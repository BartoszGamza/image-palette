<template>
  <div>
    <img ref="sampleImage" :src="sampleImageSource" alt="sample">
    <button @click="renderCanvas">Render</button>
    <canvas ref="imageCanvas"></canvas>
  </div>
</template>

<script>
export default {
  data () {
    return {
      pixelsColorArray: []
    }
  },
  methods: {
    chunkArray (arr, size, offset) {
      let results = []
      for (let i = 0; i < arr.length; i += size) {
        results.push(arr.slice(i, i + (size - offset)))
      }
      return results
    },
    renderCanvas () {
      let canvas = this.$refs.imageCanvas
      let context = canvas.getContext('2d')
      let image = this.$refs.sampleImage

      canvas.width = image.width
      canvas.height = image.height

      context.drawImage(image, 0, 0)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      console.log(imageData.data)

      // 161, 170, 201, 255
      // notes:
      // r g b a , where a is 0-255 its 0 to 1 in original

      const chunkedArray = this.chunkArray(imageData.data, 4, 1)
      const firstPixel = chunkedArray[0]
      const firstPixelHsv = this.rgbToHsv(firstPixel)
      console.log(firstPixel, firstPixelHsv)

      const normalizedHsvArray = chunkedArray.map(arr => this.rgbToHsv(arr))
      console.log(normalizedHsvArray)
      console.log('most: ', this.mode(normalizedHsvArray))

      // https://stackoverflow.com/questions/1106190/algorithm-challenge-generate-color-scheme-from-an-image
    },
    rgbToHsv ([r, g, b]) {
      // http://www.javascripter.net/faq/rgb2hsv.htms
      r = r / 255
      g = g / 255
      b = b / 255
      let minRGB = Math.min(r, Math.min(g, b))
      let maxRGB = Math.max(r, Math.max(g, b))

      let computedH = 0
      let computedS = 0
      let computedV = 0

      // Black-gray-white
      if (minRGB === maxRGB) {
        computedV = minRGB
        return [0, 0, computedV]
      }

      // Colors other than black-gray-white:
      let d = (r === minRGB) ? g - b : ((b === minRGB) ? r - g : b - r)
      let h = (r === minRGB) ? 3 : ((b === minRGB) ? 1 : 5)
      computedH = 60 * (h - d / (maxRGB - minRGB))
      computedS = (maxRGB - minRGB) / maxRGB
      computedV = maxRGB
      return this.normalizeHsv([Math.round(computedH), Math.round(computedS * 100), Math.round(computedV * 100)])
    },
    normalizeHsv ([h, s, v]) {
      // reduce number of *slightly* different colors
      return [Math.round(h / 16), Math.round(s / 10), Math.round(v / 10)]
    }
  },
  computed: {
    sampleImageSource () {
      return require('@/assets/sample.jpg')
    }
  }
}
</script>
