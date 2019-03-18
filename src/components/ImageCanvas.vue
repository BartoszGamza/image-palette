<template>
  <div>
    <input
      style="display: none"
      type="file"
      @change="imageUploadHandler($event)" accept="image/*"
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
        @click="copyColorHandler(color)"
      >
      {{ color }}
      </div>
    </div>
  </div>
</template>

<script>
import topColorsByHistogram from '@/lib/Histogram'
import { chunkArray, RGBtoHex } from '@/lib/Helpers'

export default {
  data () {
    return {
      topTenColors: [],
      showPreview: false,
      imagePreview: ''
    }
  },
  methods: {
    boxColor (color) {
      return {
        backgroundColor: color
      }
    },
    copyColorHandler (color) {
      const el = document.createElement('textarea')
      el.value = color
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    },
    decodeRGB (pixel) {
      return pixel.join(',')
    },
    imageUploadHandler (e) {
      let file = e.target.files[0]
      let reader = new FileReader()

      reader.addEventListener('load', function () {
        this.showPreview = true
        this.imagePreview = reader.result
      }.bind(this), false)

      reader.readAsDataURL(file)
    },
    renderCanvas () {
      let canvas = this.$refs.imageCanvas
      let context = canvas.getContext('2d')
      let image = this.$refs.imagePreview

      canvas.width = image.width
      canvas.height = image.height

      context.drawImage(image, 0, 0)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

      const chunkedArray = chunkArray(imageData.data, 4, 1)

      const histogramBlocks = topColorsByHistogram({
        chunkedArray,
        nBlocks: 3,
        nTop: 10
      })

      this.topTenColors = histogramBlocks.map(c => RGBtoHex(c))
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
