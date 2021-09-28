<template>
  <q-dialog v-model="confirm" @escape-key="cancelDialog" @keyup.enter.prevent="addShortcut">
    <q-card class="q-dialog-size q-px-sm" style="min-width: 300px">
        <q-card
          v-if="shortcut"
          flat
          class="q-mx-md q-mt-md select-text-disable"
          style="width: 150px; height: 175px;" align="center"
        >
          <div class="large">
            <div class="file-focus file">
              <div
                class="file-card"
                style="height: 150px; border-radius: 3px"
              >
                <div class="image q-px-sm" style="padding-top: 28px; height: 113px;">
                  <div class="img-block">
                    <span class="icon"></span>
                  </div>
                </div>
              </div>
              <div class="flex q-mt-xs" style="justify-content: space-between;font-size: 10pt;">
                <div class="q-ml-sm">
                  <b>{{ getShortName(shortcut) }}</b>
                  <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">{{ shortcut.Name }}</q-tooltip>
                </div>
                <div class="q-mr-sm" style="align-items: center">
                  <span>{{ getFileSize(shortcut) }}</span>
                </div>
              </div>
            </div>
          </div>
      </q-card>
      <q-item class="q-mt-sm">
        <div class="q-mr-md flex" style="align-items: center;">
          <span>External document URL</span>
        </div>
        <q-item-section style="width: 100%">
          <q-input outlined autofocus dense v-model="url" @input="throttledSave"/>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-label caption >Only the link to the file will be added to Files. The file itself will remain at the<br>
        original location. If the original file is deleted, the link will no longer be valid.</q-item-label>
      </q-item>
      <q-card-actions align="right">
        <q-btn flat :disable="!shortcut || creating" :ripple="false" color="primary" @click="addShortcut"
               label="Add shortcut" />
        <q-btn flat class="q-px-sm" :ripple="false" color="grey-6" @click="cancelDialog"
               label="Cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import text from '../../utils/text'
import _ from 'lodash'

export default {
  name: 'CreateShortcutDialog',
  data () {
    return {
      creating: false,
      url: '',
      confirm: false,
      shortcut: null
    }
  },
  computed: {
    currentPath () {
      return this.$store.getters['files/getCurrentPath']
    },
    currentStorage () {
      return this.$store.getters['files/getCurrentStorage']
    },
    throttledSave () {
     return _.throttle(this.checkUrl, 2000);
    },
  },
  methods: {
    getShortName (shortcut) {
      if (shortcut?.Name.length > 12) {
        return shortcut?.Name.substr(0, 10) + '...'
      }
      return shortcut?.Name
    },
    getFileSize (shortcut) {
      if (shortcut?.Size !== -1) {
        return text.getFriendlySize(shortcut?.Size)
      }
      return ''
    },
    checkUrl () {
      this.$store.dispatch('files/checkUrl', { url: this.url}).then( result => {
        this.shortcut = result
      })
    },
    openDialog () {
      this.creating = false
      this.shortcut = null
      this.url = ''
      this.confirm = true
    },
    cancelDialog () {
      this.confirm = false
    },
    addShortcut () {
      this.creating = true
     if (this.shortcut) {
       this.$store.dispatch('files/createLink', {
         type: this.currentStorage.Type,
         path: this.currentPath,
         link: this.url,
         name: this.shortcut.Name
       }).then( result => {
           if (result) {
             this.confirm = false
             this.$store.dispatch('files/getFiles', {
               currentStorage: this.currentStorage.Type,
               path: this.currentPath,
             })
           }
           this.creating = false
       })
     }
    }
  }
}
</script>

<style scoped lang="scss">
.file .icon {
  background-image: url('../../assets/sprites.png');
  background-repeat: no-repeat;
  background-position: 0 -360px;
  display: inline-block;
  height: 32px;
  width: 32px;
}
.large .file .icon {
  background-position: 0 -400px;
  height: 64px;
  width: 64px;
}
.file-card {
  box-shadow: 0 2px 6px #ccc;
}
.img-block {
  height: 74px;
}
.large .folder .icon {
  background-position: -880px -400px;
  height: 65px;
  width: 66px;
}
</style>
