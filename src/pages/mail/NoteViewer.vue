<template>
  <div class="full-height bg-white text-grey-8" style="overflow:hidden">
    <div class="pannel-hint non-selectable" v-if="message === null">
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
      hasChanges: false
    }
  },
  watch: {
    sText() {
      this.$store.commit('mail/setHasChanges', this.sText !== this.sTextSource)
    },
    message() {
      if (this.message !== null) {
        this.sTextSource = textUtils.htmlToPlain(this.message.HtmlRaw)
        this.sText = textUtils.htmlToPlain(this.message.HtmlRaw)
      }
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
      return this.checkedMessagesUids.length
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

      this.$store.dispatch('mail/saveNote', {
        messageUid: this.message.Uid,
        sFolderFullName: this.message.Folder,
        sText: this.sText,
        sSubject: sSubject[0]
      })
    },
    cancelNote() {
      this.sText = textUtils.htmlToPlain(this.message.HtmlRaw)
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
      this.sTextSource = textUtils.htmlToPlain(this.message.HtmlRaw)
      this.sText = textUtils.htmlToPlain(this.message.HtmlRaw)
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
