<template>
  <q-dialog v-model="confirm" persistent>
    <q-card class="q-dialog-size">
      <q-card-section>
        <span>Discard unsaved changes?</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :ripple="false" color="primary" @click="discard"
               label="Ok" />
        <q-btn flat class="q-px-sm" :ripple="false" color="grey-6" @click="cancel"
               label="Cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'UnsavedChangesDialog',
  data () {
    return {
      confirm: false,
      next: null,
      currentComponent: false
    }
  },
  methods: {
    openConfirmDiscardChangesDialog: async function (next) {
      this.next = next
      this.confirm = true
    },
    openConfirmDiscardChangesDialogT: async function () {
      this.currentComponent = true
      this.confirm = true
    },
    discard () {
      // proceed with new screen, current changes will be lost
      if (!this.currentComponent) {
        if (_.isFunction(this.next)) {
          this.next()
        }
        this.confirm = false
      } else {
        this.confirm = false
        this.$emit('confirmDiscardChanges',  true)
      }
    },
    cancel () {
      // stay put, changes need to be cared of
      this.confirm = false
    },
  },
}
</script>

<style scoped>

</style>
