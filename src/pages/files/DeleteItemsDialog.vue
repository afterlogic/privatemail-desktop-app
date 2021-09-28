<template>
  <q-dialog v-model="confirm" @escape-key="cancel">
    <q-card class="q-dialog-size">
      <q-card-section>
        <span>{{ title }}</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :ripple="false" color="primary" @click="deleteItems"
               label="Delete" />
        <q-btn flat class="q-px-sm" :ripple="false" color="grey-6" @click="cancel"
               label="Cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'DeleteItemsDialog',
  props: {
    items: {
      Type: Array,
      Default: []
    },
   currentFile: Object
  },
  data () {
    return {
      confirm: false
    }
  },
  computed: {
    title () {
      if (this.items.length > 1) {
        return 'Delete selected items permanently?'
      }
      if (this.currentFile?.IsFolder) {
        return 'Delete selected folder permanently?'
      }
      return 'Delete selected file permanently?'
    },
  },
  methods: {
    listener(event) {
      if (event.keyCode === 13) {
        this.deleteItems()
      }
    },
    openDialog () {
      window.addEventListener('keyup', this.listener, false)
      this.confirm = true
    },
    deleteItems () {
      window.removeEventListener('keyup', this.listener, false)
      this.$emit('removeItems')
      this.confirm = false
    },
    cancel () {
      window.removeEventListener('keyup', this.listener, false)
      this.confirm = false
    }
  }
}
</script>

<style scoped>

</style>
