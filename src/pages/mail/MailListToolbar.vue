<template>
  <div class="row q-pa-sm items-center">
    <q-btn-dropdown split flat color="primary" icon="drafts" :disable-main-btn="checkedCount === 0" @click="setMessagesRead(true)">
      <template v-slot:label>
        <q-tooltip>
          Mark As Read
        </q-tooltip>
      </template>
      <q-list>
        <q-item clickable v-close-popup @click="setAllMessagesRead">
          <q-item-section>
            <q-item-label>Mark All Read</q-item-label>
          </q-item-section>
        </q-item>
        <q-item :disable="checkedCount === 0" clickable v-close-popup @click="setMessagesRead(false)">
          <q-item-section>
            <q-item-label>Mark As Unread</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <q-btn-dropdown flat color="primary" icon="move_to_inbox" :disable="checkedCount === 0">
      <template v-slot:label>
        <q-tooltip>
          Move To Folder
        </q-tooltip>
      </template>
      <q-list>
        <MoveToFolderItem v-for="folder in foldersTree" :key="folder.Hash" :folder="folder" :level="1" :moveMessagesToFolder="moveMessagesToFolder"></MoveToFolderItem>
      </q-list>
    </q-btn-dropdown>
    <q-btn flat color="primary" icon="delete_outline" no-wrap :label="checkedCount > 0 ? checkedCount : ''" :disable="checkedCount === 0" @click="deleteMessages">
      <q-tooltip>
        Delete
      </q-tooltip>
    </q-btn>
    <q-btn flat color="primary" icon="error_outline" :disable="checkedCount === 0" @click="moveMessagesToSpam">
      <q-tooltip>
        Spam
      </q-tooltip>
    </q-btn>
    <q-space/>

    <span>
      <q-btn flat color="primary" icon="sync" :loading=mailSyncing @click="sync" />
      <q-tooltip>
        Check Mail
      </q-tooltip>
    </span>

    <q-dialog v-model="confirmDeletePermanently" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Delete selected message(s) permanently?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Delete" color="primary" @click="deleteMessagesPermanently" v-close-popup />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style>
</style>

<script>
import { colors } from 'quasar'

import mailEnums from 'src/modules/mail/enums.js'
import prefetcher from 'src/modules/mail/prefetcher.js'

import MoveToFolderItem from './MoveToFolderItem.vue'

const alerts = [
  { color: 'negative', message: 'Woah! Danger! You are getting good at this!', icon: 'report_problem' },
  { message: 'You need to know about this!', icon: 'warning' },
  { message: 'Wow! Nice job!', icon: 'thumb_up' },
  { color: 'teal', message: 'Quasar is cool! Right?', icon: 'tag_faces' },
  { color: 'purple', message: 'Jim just pinged you', avatar: 'https://cdn.quasar.dev/img/boy-avatar.png' },
  { multiLine: true, message: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Hic quisquam non ad sit assumenda consequuntur esse inventore officia. Corrupti reiciendis impedit vel, fugit odit quisquam quae porro exercitationem eveniet quasi.' }
]

export default {
  name: 'MailListToolbar',

  components: {
    MoveToFolderItem,
  },

  props: {
    checkedMessagesUids: Array
  },

  data () {
    return {
      confirmDeletePermanently: false,
    }
  },

  computed: {
    mailSyncing () {
      return this.$store.getters['mail/getSyncing']
    },
    checkedCount () {
      return this.checkedMessagesUids.length
    },
    foldersTree () {
      return this.$store.getters['mail/getCurrentFoldersTree']
    },
    currentFolder () {
      return this.$store.getters['mail/getCurrentFolder']
    },
  },

  methods: {
    setMessagesRead (bIsSeen) {
      if (this.checkedCount > 0) {
        this.$store.dispatch('mail/setMessagesRead', {
          Uids: this.checkedMessagesUids,
          IsSeen: bIsSeen,
        })
      }
    },
    setAllMessagesRead () {
      this.$store.dispatch('mail/setAllMessagesRead')
    },
    deleteMessagesPermanently () {
      if (this.checkedCount > 0) {
        this.$store.dispatch('mail/deleteMessages', {
          'Uids': this.checkedMessagesUids,
        })
      }
    },
    deleteMessages () {
      if (this.currentFolder.Type === mailEnums.FolderType.Spam) {
        this.deleteMessagesPermanently()
      } else if (this.currentFolder.Type === mailEnums.FolderType.Trash) {
        this.confirmDeletePermanently = true
      } else {
        this.moveMessagesToTrash()
      }
    },
    moveMessagesToTrash () {
      this.moveMessagesToFolder('Trash')
    },
    moveMessagesToSpam () {
      this.moveMessagesToFolder('Spam')
    },
    moveMessagesToFolder (sFolder) {
      if (this.checkedCount > 0) {
        this.$store.dispatch('mail/moveMessagesToFolder', {
          'ToFolder': sFolder,
          'Uids': this.checkedMessagesUids,
        })
      }
    },
    sync () {
      prefetcher.checkMail()
    },
    swithTheme () {
      colors.setBrand('primary', '#000')
    },
    swithTheme1 () {
      colors.setBrand('primary', '#f00')
    },
    showNotif () {
      const position = 'top-right'
      const { color, textColor, multiLine, icon, message, avatar } = alerts[ Math.floor(Math.random(alerts.length) * 10) % alerts.length ]
      const random = Math.random() * 100

      const twoActions = random > 70
      const buttonColor = color ? 'white' : void 0

      this.$q.notify({
        color,
        textColor,
        icon: random > 30 ? icon : null,
        message,
        position,
        avatar,
        multiLine,
        actions: twoActions
          ? [
            { label: 'Reply', color: buttonColor, handler: () => console.log('wooow') },
            { label: 'Dismiss', color: 'yellow', handler: () => console.log('wooow') }
          ]
          : (random > 40
            ? [ { label: 'Reply', color: buttonColor, handler: () => console.log('wooow') } ]
            : null
          ),
        timeout: Math.random() * 5000 + 3000
      })
    },
  },
}
</script>
