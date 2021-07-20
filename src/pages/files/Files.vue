<template>
  <div class="col">
    <q-scroll-area class="full-height">
      <div class="row q-pa-sm">
        <q-card class="q-ma-md" v-for="n in 20" :key="n">
          <q-card-section>
            <div class="text-subtitle2">by John Doe</div>
          </q-card-section>

          <q-separator/>
          <q-card-section>
            Image.jpg
          </q-card-section>
        </q-card>
      </div>
    </q-scroll-area>
  </div>
</template>

<script>
export default {
  name: 'Files',
  props: {
    currentStorage: {
      Type: Object,
      Default: {}
    }
  },
  mounted() {
    this.populate()
  },
  methods: {
    populate () {
      this.$store.dispatch('files/getFiles')
    }
  }
}
</script>

<style scoped>

</style>
