<template>
  <div>
    <input
      style="display: none"
      type="file"
      @change="imageUploadHandler($event)" accept=".jpg"
      ref="fileInput"
    >
    <button @click="$refs.fileInput.click()"> Pick File</button>
    <button v-if="imagePreview" @click="renderCanvas">Render</button>
    <div v-if="showPreview">
      <img :src="imagePreview" ref="imagePreview" />
    </div>
    <canvas ref="imageCanvas" class="renderedCanvas"></canvas>
    <div v-if="topTenColors.length" class="colorPalette__wrapper">
      <div
        v-for="(color, i) in topTenColors"
        :key="i"
        class="colorPalette__box"
        :style="boxColor(color)"
      >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      topTenColors: [],
      showPreview: false,
      imagePreview: '',
    }
  },
  methods: {
    boxColor (color) {
      return {
        backgroundColor: `hsl(${color})`
      }
    },
    chunkArray (arr, size, offset) {
      let results = []
      for (let i = 0; i < arr.length; i += size) {
        results.push(arr.slice(i, i + (size - offset)))
      }
      return results
    },
    decodeColor ([h, s, l]) {
      return `${h}, ${s}%, ${l}%`
    },
    hslArray (code) {
      let codeArr = code.split('.').map(x => parseInt(x))
      return [codeArr[0] * 16, codeArr[1] * 10, codeArr[2] * 10]
    },
    imageUploadHandler (e) {
      let file = e.target.files[0]
      let reader = new FileReader()

      reader.addEventListener("load", function () {
        this.showPreview = true
        this.imagePreview = reader.result
      }.bind(this), false)

      reader.readAsDataURL( file )
    },
    renderCanvas () {
      let canvas = this.$refs.imageCanvas
      let context = canvas.getContext('2d')
      let image = this.$refs.imagePreview

      canvas.width = image.width
      canvas.height = image.height

      context.drawImage(image, 0, 0)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      // console.log(imageData.data)

      // 161, 170, 201, 255
      // notes:
      // r g b a , where a is 0-255 its 0 to 1 in original

      const chunkedArray = this.chunkArray(imageData.data, 4, 1)
      const firstPixel = chunkedArray[0]
      const firstPixelHsv = this.rgbToHsv(firstPixel)
      // console.log(firstPixel, firstPixelHsv)

      const normalizedHsvArray = chunkedArray.map(arr => this.rgbToHsv(arr))
      // console.log(normalizedHsvArray)
      const topTen = this.mostOccurencies(normalizedHsvArray)

      const colors = topTen.map(c => this.hslArray(c)).map(a => this.decodeColor(a))
      this.topTenColors = colors

      // https://stackoverflow.com/questions/1106190/algorithm-challenge-generate-color-scheme-from-an-image
    },
    mostOccurencies (arr) {
      let colorMap = {}

      for (let i = 0; i < arr.length; i++) {
        let currentElement = arr[i].join('.')
        if (!colorMap[currentElement]) {
          colorMap[currentElement] = 1
        } else {
          colorMap[currentElement]++
        }
      }
      return Object.keys(colorMap).sort((a,b) => {return colorMap[b]-colorMap[a]}).slice(0, 10)
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
        return [0, 0, computedV] // TODO normalize !
      }

      // Colors other than black-gray-white:
      let d = (r === minRGB) ? g - b : ((b === minRGB) ? r - g : b - r)
      let h = (r === minRGB) ? 3 : ((b === minRGB) ? 1 : 5)
      computedH = 60 * (h - d / (maxRGB - minRGB))
      computedS = (maxRGB - minRGB) / maxRGB
      computedV = maxRGB
      return this.normalizeHsv([Math.round(computedH), Math.round(computedS * 100), Math.round(computedV * 100)])
    },
    sortTopTen (obj) {
      return Object.keys(obj).sort((a,b) => {return obj[b]-obj[a]}).slice(0, 10)
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

<style lang="scss" scoped>
.renderedCanvas {
   display: none;
}

.colorPalette__wrapper {
  display: flex;
  flex-wrap: wrap;
}

.colorPalette__box {
  width: 100px;
  height: 100px;
  color: red;
}

</style>

