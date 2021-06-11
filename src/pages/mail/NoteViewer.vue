<template>
  <div class="full-height bg-white text-grey-8" style="overflow:hidden">
    <div class="pannel-hint non-selectable" v-if="currentNote === null">
      No note selected.
      <br/>
      <div class="sub-hint">Click any note in the list to preview it here or double-click to view it full size.</div>
    </div>

    <div class="full-height" v-else>
      <div class="q-pa-md" style="height: 90%">
        <textarea
          ref="noteInput" v-model="sText" type="textarea"
          style="resize: none; width: 100%; height: 100%; border: none"
          placeholder="Enter your note here"
          v-on:keyup.ctrl.s="saveNote"
        />
      </div>
      <q-toolbar class="buttons" style="height: 10%">
        <q-btn v-if="!bSavingNote" unelevated color="primary" label="Save" @click="saveNote"/>
        <q-btn v-else unelevated color="primary" label="Saving..."/>
        <q-btn unelevated outline color="primary" label="Cancel" @click="cancelNote"/>
        <span>Ctrl+S to save</span>
      </q-toolbar>
    </div>
    <q-dialog v-model="bConfirm" persistent>
      <q-card style="width: 300px">
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
import $ from "lodash/string";

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
      currentNote: null,
      bSavingNote: false
    }
  },
  watch: {
    sText() {
      this.$store.commit('mail/setHasChanges', this.sText !== this.sTextSource)
    },
    currentNote() {
      if (this.currentNote !== null) {
        this.$nextTick(() => {
          this.$refs.noteInput.focus()
        })
        this.sTextSource = textUtils.htmlToPlain(this.currentNote.HtmlRaw ? this.currentNote.HtmlRaw : this.currentNote.PlainRaw)
        this.sText = textUtils.htmlToPlain(this.currentNote.HtmlRaw ? this.currentNote.HtmlRaw : this.currentNote.PlainRaw)
      }
    },
    message() {
      if (this.bSavingNote) {
        this.$store.commit('mail/setCurrentMessage', this.currentMessages[0])
        this.bSavingNote = false
      } else {
        this.currentNote = this.message
      }
    },
    triggerChangesDialogue() {
      this.bConfirm = this.triggerChangesDialogue
    },
    currentMessages() {
      if (this.bSavingNote) {
        this.$store.commit('mail/setCurrentMessage', this.currentMessages[0])
        this.currentNote = this.currentMessages[0]
        this.bSavingNote = false
      }
    }
  },
  computed: {
    triggerChangesDialogue() {
      return this.$store.getters['mail/getTriggerChangesDialogue']
    },
    checkedCount () {
      return this.checkedMessagesUids.length
    },
    currentMessages() {
      return this.$store.getters['mail/getCurrentMessages']
    }
  },
  beforeDestroy() {
    this.currentNote = null
  },
  methods: {
    saveNote() {
      this.bSavingNote = true
      this.$store.commit('mail/setHasChanges', false)
      this.$store.commit('mail/setTriggerChangesDialogue', false)

      let aText = this.sText.split(/\r\n|\n/i)
      let sSubject = _.find(aText, function (sTextPart) {
          return $.trim(sTextPart) !== ''
        })
      sSubject = $.trim(sSubject)
      if (sSubject.length > 50)
      {
        sSubject = sSubject.substring(0, 50);
      }

      if (this.currentNote.Uid === '') {
        this.$store.dispatch('mail/saveNote', {
          messageUid: '',
          sFolderFullName: this.currentNote.Folder,
          sText: this.sText,
          sSubject: sSubject,
          callback: this.isSaveNote
        })
      } else {
        this.$store.dispatch('mail/saveNote', {
          messageUid: this.currentNote.Uid,
          sFolderFullName: this.currentNote.Folder,
          sText: this.sText,
          sSubject: sSubject,
          callback: this.isSaveNote
        })
      }
    },
    isSaveNote(bResult) {
      if (bResult) {
        this.currentNote = null
      }
    },
    newNote() {
      this.currentNote = {
        HtmlRaw: null,
        PlainRaw: '',
        Folder: this.$store.getters['mail/getCurrentFolderFullName'],
        Uid: ''
      }
    },
    cancelNote() {
      this.sText = textUtils.htmlToPlain(this.currentNote.HtmlRaw ? this.currentNote.HtmlRaw : this.currentNote.PlainRaw)
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
      if (selectedItem.changePage) {
        this.$emit('changePageNotes', selectedItem.changePage);
      }
      this.$store.commit('mail/setTriggerChangesDialogue', false)
      this.sTextSource = textUtils.htmlToPlain(this.currentNote.HtmlRaw ? this.currentNote.HtmlRaw : this.currentNote.PlainRaw)
      this.sText = textUtils.htmlToPlain(this.currentNote.HtmlRaw ? this.currentNote.HtmlRaw : this.currentNote.PlainRaw)
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
</style>
