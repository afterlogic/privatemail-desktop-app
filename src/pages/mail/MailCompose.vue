<template>
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <div class="column bg-white" style="min-width: 800px; ">
        <div class="col-auto bg-grey-9 theme-text">
          <div class="row">
          </div>
        </div>
        <q-toolbar class=" bg-grey-9 theme-text">
          <q-btn  flat icon="send" label="Send" />
          <q-btn  flat icon="save" label="Save" />
          <q-space />
          <q-btn dense flat icon="minimize" @click="maximizedToggle = false" :disable="!maximizedToggle">
            <!-- <q-tooltip v-if="maximizedToggle" content-class="bg-white text-primary">Minimize</q-tooltip> -->
          </q-btn>
          <q-btn dense flat icon="crop_square" @click="maximizedToggle = true" :disable="maximizedToggle">
            <!-- <q-tooltip v-if="!maximizedToggle" content-class="bg-white text-primary">Maximize</q-tooltip> -->
          </q-btn>
          <q-btn dense flat icon="close" v-close-popup>
            <!-- <q-tooltip content-class="bg-white text-primary">Close</q-tooltip> -->
          </q-btn>
        </q-toolbar>
        <div class="col q-pa-md">
          <q-list style="max-width: 500px;">
            <q-item>
              <q-item-section side center style="min-width: 100px;">
                To
              </q-item-section>
              <q-item-section>
                <q-input outlined v-model="toText" :dense=true style="width: 100%;" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section side center style="min-width: 100px;">
                CC
              </q-item-section>
              <q-item-section>
                <q-input outlined v-model="ccText" :dense=true style="width: 100%;" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section side center style="min-width: 100px;">
                Subject
              </q-item-section>
              <q-item-section>
                <q-input outlined v-model="subjectText" :dense=true style="width: 100%;" />
              </q-item-section>
            </q-item>
          </q-list>
          <q-editor v-model="editortext" height="400px" class="col" />
        </div>
      </div>
      <!-- <q-bar> -->
      <!-- </q-bar> -->
    </q-dialog>
</template>

<style></style>

<script>
// import FolderList from "components/FolderList.vue"

export default {
  name: "MailCompose",
  components: {
    // MessageViewer,
  },
  data () {
    return {
      dialog: false,
      maximizedToggle: false,
      editortext: '',
      toText: '',
      ccText: '',
      subjectText: ''
    }
  },
  methods: {
    openCompose () {
      this.dialog = true;
    }
  }
};
</script>
