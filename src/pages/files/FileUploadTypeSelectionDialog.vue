<template>
  <q-dialog v-model="confirm" @escape-key="cancel">
    <q-card class="q-dialog-size q-px-sm" style="min-width: 300px">
      <div class="q-mx-md q-mt-md" style="color: #929292; font-size: 10pt">
        <div v-if="files.length > 1">
          <div class="q-mb-md">
            {{ `Encrypt ${files.length} files?` }}
          </div>
          <div v-for="file in files" :key="file.Hash">
            <span>{{file.Name}}</span>
          </div>
        </div>
        <div v-if="files.length === 1">
          {{ `Encrypt "${files[0].Name}"?` }}
        </div>
      </div>
      <q-card-actions align="right">
        <q-btn flat :ripple="false" color="primary"
               label="Encrypt" @click="encrypt(true)"/>
        <q-btn flat :ripple="false" color="primary" @click="encrypt(false)"
               label="Do not Encrypt" />
        <q-btn flat class="q-px-sm" :ripple="false" color="grey-6" @click="cancel"
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
