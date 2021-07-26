<template>
  <q-dialog v-model="confirm" persistent>
    <q-card class="q-dialog-size">
      <q-card-section>
        <span>{{ title }}</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :ripple="false" color="primary" @click="deleteItems"
               label="Delete" />
        <q-btn flat class="q-px-sm" :ripple="false" color="primary" @click="cancel"
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
    }
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
    currentFile () {
      return this.$store.getters['files/getCurrentFile']
    }
  },
  methods: {
    openDialog () {
      this.confirm = true
    },
    deleteItems () {
      this.$emit('removeItems')
      this.confirm = false
    },
    cancel () {
      this.confirm = false
    }
  }
}
</script>

<style scoped>

</style>
