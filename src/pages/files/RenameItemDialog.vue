<template>
  <q-dialog v-model="confirm" persistent>
    <q-card class="q-dialog-size" style="min-width: 300px">
      <q-item class="q-mt-md">
        <q-item-section>
          <q-item-label>Name</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-input autofocus outlined dense v-model="itemName" />
        </q-item-section>
      </q-item>
      <q-card-actions align="right">
        <q-btn flat :ripple="false" color="primary" @click="renameItem"
               label="Save" />
        <q-btn flat class="q-px-sm" :ripple="false" color="primary" @click="cancelDialog"
               label="Cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import notification from '../../utils/notification'

export default {
  name: 'RenameItemDialog',
  data () {
    return {
      confirm: false,
      itemName: ''
    }
  },
  methods: {
    openDialog (name) {
      this.confirm = true
      this.itemName = name
    },
    renameItem () {
      if (this.itemName.length) {
        this.$emit('renameItem', this.itemName)
        this.confirm = false
      } else {
        notification.showError('Invalid folder name')
      }
    },
    cancelDialog () {
      this.confirm = false
    }
  }
}
</script>

<style scoped>

</style>
