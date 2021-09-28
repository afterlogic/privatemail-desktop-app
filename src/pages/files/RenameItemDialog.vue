<template>
  <q-dialog v-model="confirm" @escape-key="cancelDialog">
    <q-card class="q-dialog-size q-pt-md q-px-sm" style="min-width: 400px">
      <q-item>
        <q-item-section>
          <q-item-label>Name</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-input outlined autofocus dense v-model="itemName" style="width: 250px" @keyup.enter="renameItem"/>
        </q-item-section>
      </q-item>
      <q-card-actions align="right">
        <q-btn flat :ripple="false" color="primary" @click="renameItem"
               label="Save" />
        <q-btn flat class="q-px-sm" :ripple="false" color="grey-6" @click="cancelDialog"
               label="Cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import notification from '../../utils/notification'
import text from '../../utils/text'
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
      if (this.itemName.length && text.validateFileOrFolderName(this.itemName)) {
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
