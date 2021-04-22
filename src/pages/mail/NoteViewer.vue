<template>
  <div class="full-height bg-white text-grey-8" style="overflow:hidden">
    <div class="pannel-hint non-selectable" v-if="message === null">
      No note selected.
      <br/>
      <div class="sub-hint">Click any note in the list to preview it here or double-click to view it full size.</div>
    </div>

    <div class="full-height" v-else>
      <div class="q-pa-md" style="height: 90%">
        <textarea class="" v-model="sText" type="textarea"
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
          <q-avatar icon="signal_wifi_off" color="primary" text-color="white"/>
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
    message: Object
  },
  data() {
    return {
      sText: '',
      sTextSource: '',
      bConfirm: false,
      oldMessage: {},
      oldText: ''
    }
  },
  watch: {
    sText(val, oldVal) {
    /*  if (oldVal !== val && this.confirm) {
        this.oldText = oldVal
      }*/
    },
    message(val, oldVal) {
      if (val !== null) {
        if (this.sTextSource !== this.sText) {
          this.bConfirm = true
          this.oldMessage = oldVal
        } else {
            this.sTextSource = textUtils.htmlToPlain(this.message.Html)
            this.sText = textUtils.htmlToPlain(this.message.Html)
        }
      } else {
        this.sTextSource = ''
        this.sText = ''
      }
    }
  },
  created() {
    //document.addEventListener('click', () => this.getTextForInput());
  },
  methods: {
    getTextForInput() {
      console.log()
    },
    saveNote() {
      this.$store.dispatch('mail/saveNote', {
        messageUid: this.message.Uid,
        sFolderFullName: this.message.Folder,
        sText: this.sText,
        sSubject: this.message.Subject ? this.message.Subject : this.sText.split('\n')[0]
      })
    },
    cancelNote() {
      this.sText = textUtils.htmlToPlain(this.message.Html)
    },
    cancelQDialog() {
      if (this.message !== null) {
        this.$store.commit('mail/setCurrentMessage', this.oldMessage)
      }
    },
    returnPreviousValue() {
      this.sTextSource = textUtils.htmlToPlain(this.message.Html)
      this.sText = textUtils.htmlToPlain(this.message.Html)
    },
  },
  beforeDestroy() {
    console.log(this)
  },
/*   created() {
     console.log(this.sText,'beforeCreate')
   }*/
}
</script>

<style scoped>
</style>
