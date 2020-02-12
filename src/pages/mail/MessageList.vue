<template>
  <div>
    <template v-if="folderSelected">
      <template v-if="currentSearch !== ''">
        <span class="pannel-hint--link non-selectable" @click="showAllMessages">Clear search</span>
        <div class="pannel-hint non-selectable">Search results for <b>{{ currentSearch }}</b> in {{ folderName }} folder:</div>
      </template>
      <template v-if="currentFilter !== ''">
        <span class="pannel-hint--link non-selectable" @click="showAllMessages">View all messages</span>
        <div class="pannel-hint non-selectable">Unread messages in {{ folderName }} folder:</div>
      </template>
      <template v-if="messages.length === 0">
        <div class="pannel-hint non-selectable" v-if="!mailSyncing && currentFilter === '' && currentSearch === ''">The folder is empty</div>
        <div class="pannel-hint non-selectable" v-if="!mailSyncing && (currentFilter !== '' || currentSearch !== '')">No message found</div>
        <div class="pannel-hint non-selectable" v-if="mailSyncing">Loading message list...</div>
      </template>
    </template>
    <MessageListItem v-for="message in messages" :key="message.Uid" :message="message" />
  </div>
</template>

<style></style>

<script>
import MessageListItem from './MessageListItem'

export default {
  name: 'MessageList',

  components: {
    MessageListItem,
  },

  computed: {
    folderSelected () {
      let sFolderFullName = this.$store.getters['mail/getCurrentFolderFullName']
      return sFolderFullName !== ''
    },
    folderName () {
      let oFolder = this.$store.getters['mail/getCurrentFolder']
      return oFolder ? oFolder.Name : ''
    },
    messages () {
      return this.$store.getters['mail/getCurrentMessages']
    },
    mailSyncing () {
      return this.$store.getters['mail/getFoldersSyncing'] || this.$store.getters['mail/getMessagesSyncing']
    },
    currentFilter () {
      return this.$store.getters['mail/getCurrentFilter']
    },
    currentSearch () {
      return this.$store.getters['mail/getCurrentSearch']
    },
  },

  methods: {
    showAllMessages: function () {
      let sFolderFullName = this.$store.getters['mail/getCurrentFolderFullName']
      this.$store.dispatch('mail/setCurrentFolder', sFolderFullName)
    },
  },
}
</script>
