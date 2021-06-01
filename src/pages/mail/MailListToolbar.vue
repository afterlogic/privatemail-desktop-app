<template>
  <div class="row q-pa-sm items-center non-selectable">
    <span v-if="!isNotesFolder">
      <q-btn-dropdown split flat color="primary" icon="drafts" :disable-main-btn="checkedCount === 0" @click="setMessagesRead(true)">
        <q-list class="non-selectable">
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
      <q-tooltip>Mark As Read</q-tooltip>
    </span>

    <span v-if="!isNotesFolder">
      <q-btn-dropdown flat color="primary" icon="move_to_inbox" v-if="!isScheduledFolder" :disable="checkedCount === 0">
        <q-list class="non-selectable">
          <MoveToFolderItem v-for="folder in foldersTree" :key="folder.Hash" :folder="folder" :level="1" :moveMessagesToFolder="moveMessagesToFolder"></MoveToFolderItem>
        </q-list>
      </q-btn-dropdown>
      <q-tooltip>Move To Folder</q-tooltip>
    </span>

    <span>
      <q-btn flat no-wrap color="primary" icon="delete_outline" :label="checkedCount > 0 ? checkedCount : ''"
        :disable="checkedCount === 0" @click="deleteMessages" />
      <q-tooltip>Delete</q-tooltip>
    </span>

    <span v-if=isSpamFolder>
      <q-btn flat no-wrap color="primary" icon="delete_forever"
        @click="emptySpam" />
      <q-tooltip>Empty spam</q-tooltip>
    </span>

    <span v-if=isTrashFolder>
      <q-btn flat no-wrap color="primary" icon="delete_forever"
        @click="emptyTrash" />
      <q-tooltip>Empty trash</q-tooltip>
    </span>

    <span v-if=isSpamFolder>
      <q-btn flat color="primary" icon="check_circle_outline" :disable="checkedCount === 0" @click="moveMessagesToInbox" />
      <q-tooltip>Not Spam</q-tooltip>
    </span>

    <span v-if="!isSpamFolder && !isScheduledFolder && !isNotesFolder">
      <q-btn flat color="primary" :disable="checkedCount === 0" @click="moveMessagesToSpam">
          <img src="~assets/icons/spam-outlined-bold.svg" alt="">
      </q-btn>
      <q-tooltip>Spam</q-tooltip>
    </span>

    <q-space/>

    <span>
      <q-btn flat color="primary" icon="sync" :loading=mailSyncing @click="fullSync" />
      <q-tooltip>Check Mail</q-tooltip>
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

    <q-dialog v-model="confirmDeleteAllPermanently" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">All messages in this folder will be permanently deleted.</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Ok" color="primary" @click="deleteAllMessagesPermanently" v-close-popup />
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

import coreSettings from 'src/modules/core/settings.js'

import MoveToFolderItem from './MoveToFolderItem.vue'

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
      confirmDeleteAllPermanently: false,
      iRefreshTimer: 0,
    }
  },

  computed: {
    isAuthorized () {
      return this.$store.getters['user/isAuthorized']
    },
    foldersSyncing () {
      return this.$store.getters['mail/getFoldersSyncing']
    },
    mailSyncing () {
      return this.$store.getters['mail/getFoldersSyncing'] || this.$store.getters['mail/getMessagesSyncing']
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
    isSpamFolder () {
      return this.currentFolder && this.currentFolder.Type === mailEnums.FolderType.Spam
    },
    isTrashFolder () {
      return this.currentFolder && this.currentFolder.Type === mailEnums.FolderType.Trash
    },
    isScheduledFolder () {
      return this.currentFolder && this.currentFolder.Type === mailEnums.FolderType.Scheduled
    },
    isNotesFolder() {
      return this.currentFolder && this.currentFolder.Type === mailEnums.FolderType.Notes
    }
  },

  watch: {
    isAuthorized () {
      clearTimeout(this.iRefreshTimer)
    },
    foldersSyncing () {
      if (coreSettings.iAutoRefreshIntervalMinutes > 0) {
        clearTimeout(this.iRefreshTimer)
        if (!this.foldersSyncing) {
          this.iRefreshTimer = setTimeout(this.sync, coreSettings.iAutoRefreshIntervalMinutes * 60000)
        }
      }
    },
  },

  methods: {
    setMessagesRead (bIsSeen) {
      if (this.checkedCount > 0) {
        this.$store.dispatch('mail/asyncSetMessagesRead', {
          aUids: this.checkedMessagesUids,
          bIsSeen,
        })
      }
    },
    setAllMessagesRead () {
      this.$store.dispatch('mail/asyncSetAllMessagesRead')
    },
    deleteMessagesPermanently () {
      if (this.checkedCount > 0) {
        this.$store.dispatch('mail/asyncDeleteMessages', {
          aUids: this.checkedMessagesUids,
        })
      }
    },
    deleteMessages () {
      if (this.$store.getters['mail/getHasChanges']) {
        this.$store.commit('mail/setSelectedItem', {deleteMessage: 'delete'})
        this.$store.commit('mail/setTriggerChangesDialogue', true)
      } else {
        if (this.currentFolder.Type === mailEnums.FolderType.Spam || this.currentFolder.Type === mailEnums.FolderType.Trash) {
          this.confirmDeletePermanently = true
        } else {
          this.moveMessagesToTrash()
        }
      }
    },
    moveMessagesToTrash () {
      let sTrashFullName = this.$store.getters['mail/getTrashFullName']
      this.moveMessagesToFolder(sTrashFullName)
    },
    moveMessagesToSpam () {
      let sSpamFullName = this.$store.getters['mail/getSpamFullName']
      this.moveMessagesToFolder(sSpamFullName)
    },
    moveMessagesToInbox () {
      let sInboxFullName = this.$store.getters['mail/getInboxFullName']
      this.moveMessagesToFolder(sInboxFullName)
    },
    emptySpam () {
      this.confirmDeleteAllPermanently = true
    },
    emptyTrash () {
      this.confirmDeleteAllPermanently = true
    },
    deleteAllMessagesPermanently () {
      this.$store.dispatch('mail/asyncClearCurrentFolder')
    },
    moveMessagesToFolder (sFolder) {
      if (this.checkedCount > 0) {
        this.$store.dispatch('mail/asyncMoveMessagesToFolder', {
          aUids: this.checkedMessagesUids,
          sToFolderFullName: sFolder,
        })
      }
    },
    sync () {
      clearTimeout(this.iRefreshTimer)
      if (!this.mailSyncing) {
        this.$store.dispatch('mail/asyncRefresh')
      }
    },
    fullSync () {
      if (this.$store.getters['mail/getHasChanges']) {
        this.$store.commit('mail/setSelectedItem', {fullSync: 'sync'})
        this.$store.commit('mail/setTriggerChangesDialogue', true)
      } else {
        clearTimeout(this.iRefreshTimer)
        this.$store.dispatch('mail/asyncRefresh', true)
      }
    },
  },
}
</script>
