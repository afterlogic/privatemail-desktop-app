<template>
  <q-dialog v-model="confirm" persistent>
    <q-card class="popup_panel">
      <q-img src="https://cdn.quasar.dev/img/chicken-salad.jpg" />
      <div class="flex panels">
        <q-card-section class="storages">
          hello1
        </q-card-section>

        <q-card-section class="files">
          hello2
        </q-card-section>
      </div>

      <q-separator />

      <q-card-actions class="buttons" align="right">
        <q-btn flat :ripple="false" color="primary" @click="select"
               label="Select" />
        <q-btn flat class="q-px-sm" :ripple="false" color="primary" @click="cancel"
               label="Cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'FilesUI',
  data () {
    return {
      confirm: false
    }
  },
  methods: {
    openDialog () {
      this.confirm = true
    },
    select () {
      console.log('select')
    },
    cancel () {
      this.confirm = false
    }
  }
}
</script>

<style scoped>
.storages {
  width: 30%;
}
.files {
  width: 70%;
}
.popup_panel {
  min-width: 840px;
  height: 400px;
}
.panels {
  height: 345px;
}
</style>
