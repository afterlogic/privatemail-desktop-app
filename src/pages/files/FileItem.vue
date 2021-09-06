<template>
  <div class="file-item">
    {{ innerFile.__progressLabel }}
  </div>
</template>

<script>
export default {
  name: 'FileItem',
  props: {
    file: { type: [Object, File], required: true }
  },
  data() {
    return {
      innerFile: this.file
    }
  },
  watch: {
    file: {
      handler() {
        this.innerFile = this.file
        console.log('file')
      },
      deep: true
    }

  }
}
</script>
