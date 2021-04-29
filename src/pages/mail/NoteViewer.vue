<template>
  <div class="full-height bg-white text-grey-8" style="overflow:hidden">
    <div class="pannel-hint non-selectable" v-if="currentNote === null">
      No note selected.
      <br/>
      <div class="sub-hint">Click any note in the list to preview it here or double-click to view it full size.</div>
    </div>

    <div class="full-height" v-else>
      <div class="q-pa-md" style="height: 90%">
        <textarea v-model="sText" type="textarea"
                  style="resize: none; width: 100%; height: 100%; border: none"/>
      </div>
      <q-toolbar class="buttons" style="height: 10%">
        <q-btn unelevated color="primary" label="Save" @click="saveNote"/>
        <q-btn unelevated outline color="primary" label="Cancel" @click="cancelNote"/>
      </q-toolbar>
    </div>
    <q-dialog v-model="bConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Discard unsaved changes?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Ok" color="primary" v-close-popup @click="returnPreviousValue"/>
          <q-btn flat label="Cancel" color="primary" v-close-popup @click="cancelQDialog"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import textUtils from "../../utils/text";

export default {
  name: "NoteViewer",
  props: {
    message: Object,
    checkedMessagesUids: Array,
    searchInputText: String
  },
  data() {
    return {
      sText: '',
      sTextSource: '',
      bConfirm: false,
      currentNote: null
    }
  },
  watch: {
    sText() {
      this.$store.commit('mail/setHasChanges', this.sText !== this.sTextSource)
    },
    currentNote() {
      if (this.currentNote !== null) {
        this.sTextSource = textUtils.htmlToPlain(this.currentNote.HtmlRaw)
        this.sText = textUtils.htmlToPlain(this.currentNote.HtmlRaw)
      }
    },
    message() {
      this.currentNote = this.message
    },
    triggerChangesDialogue() {
      this.bConfirm = this.triggerChangesDialogue
    }
  },
  computed: {
    triggerChangesDialogue() {
      return this.$store.getters['mail/getTriggerChangesDialogue']
    },
    checkedCount () {
      return this.currentNote.length
    },
  },
  methods: {
    saveNote() {
      this.$store.commit('mail/setHasChanges', false)
      this.$store.commit('mail/setTriggerChangesDialogue', false)
      let sSubject =  this.sText.split('\n').filter(num => {
        if (num !== "") {
          return num
        }
      })
      if (this.currentNote.Uid === '') {
        this.$store.dispatch('mail/saveNote', {
          messageUid: '',
          sFolderFullName: this.currentNote.Folder,
          sText: this.sText,
          sSubject: sSubject[0]
        })
      } else {
        this.$store.dispatch('mail/saveNote', {
          messageUid: this.currentNote.Uid,
          sFolderFullName: this.currentNote.Folder,
          sText: this.sText,
          sSubject: sSubject[0]
        })
      }
    },
    newNote() {
      this.currentNote = {
        HtmlRaw: '',
        Folder: this.$store.getters['mail/getCurrentFolderFullName'],
        Uid: ''
      }
    },
    cancelNote() {
      this.sText = textUtils.htmlToPlain(this.currentNote.HtmlRaw)
    },
    cancelQDialog() {
      this.$store.commit('mail/setTriggerChangesDialogue', false)
    },
    returnPreviousValue() {
      this.$store.commit('mail/setHasChanges', false)
      let selectedItem = this.$store.getters['mail/getSelectedItem']

      if (selectedItem.route) {
        this.$router.push({ path: selectedItem.route })
      }
      if (selectedItem.messageUid) {
        let selectedMessage = this.$store.getters['mail/getMessageByUid'](selectedItem.messageUid)
        this.$store.dispatch('mail/setCurrentMessage', selectedMessage)
      }
      if (selectedItem.folder) {
        this.$store.dispatch('mail/setCurrentFolder', selectedItem.folder)
      }
      if (selectedItem.openCompose) {
        this.openCompose({})
      }
      if (selectedItem.deleteMessage) {
        let sTrashFullName = this.$store.getters['mail/getTrashFullName']
        this.moveMessagesToFolder(sTrashFullName)
      }
      if (selectedItem.fullSync) {
        this.$store.dispatch('mail/asyncRefresh', true)
      }
      if (selectedItem.search) {
        this.$store.dispatch('mail/asyncGetMessages', {
          iPage: 1,
          sSearch: this.searchInputText,
          sFilter: '',
        })
      }
      this.$store.commit('mail/setTriggerChangesDialogue', false)
      this.sTextSource = textUtils.htmlToPlain(this.currentNote.HtmlRaw)
      this.sText = textUtils.htmlToPlain(this.currentNote.HtmlRaw)
    },
    moveMessagesToFolder (sFolder) {
      if (this.checkedCount > 0) {
        this.$store.dispatch('mail/asyncMoveMessagesToFolder', {
          aUids: this.checkedMessagesUids,
          sToFolderFullName: sFolder,
        })
      }
    }
  },
}
</script>
<style scoped>
.note-text-area:focus {
  border: 2px solid #6d5d7e;
}
</style>
