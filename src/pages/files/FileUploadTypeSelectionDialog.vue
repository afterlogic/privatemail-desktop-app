<template>
  <q-dialog v-model="confirm" @escape-key="cancel">
    <q-card class="q-dialog-size" style="min-width: 300px">
      <div>
        <ul>
          <li v-for="file in files" :key="file.LastModified">{{file.Name}}</li>
        </ul>
      </div>
      <q-card-actions align="right">
        <q-btn flat :ripple="false" color="primary"
               label="Encrypt" @click="encrypt(true)"/>
        <q-btn flat :ripple="false" color="primary" @click="encrypt(false)"
               label="Do not Encrypt" />
        <q-btn flat class="q-px-sm" :ripple="false" color="primary" @click="cancel"
               label="Cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'FileUploadTypeSelectionDialog',
  props: {
    files: {
      Type: Array,
      Default: []
    }
  },
  data () {
    return {
      confirm: false,

    }
  },
  methods: {
    openDialog () {
      this.confirm = true
    },
    encrypt (confirm) {
      this.$emit('encrypt', confirm)
      this.confirm = false
    },
    cancel () {
      this.$emit('cancelUploading')
      this.confirm = false
    }
  }
}
</script>

<style scoped>

</style>
