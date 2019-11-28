<template>
  <div>
    <template v-if="folderSelected">
      <template v-if="currentSearch !== ''">
        <span class="pannel-hint--link" @click="showAllMessages">Clear search</span>
        <div class="pannel-hint">Search results for <b>{{ currentSearch }}</b> in {{ folderName }} folder:</div>
      </template>
      <template v-if="currentFilter !== ''">
        <span class="pannel-hint--link" @click="showAllMessages">View all messages</span>
        <div class="pannel-hint">Unread messages in {{ folderName }} folder:</div>
      </template>
      <template v-if="messages.length === 0">
        <div class="pannel-hint" v-if="!syncing && currentFilter === '' && currentSearch === ''">The folder is empty</div>
        <div class="pannel-hint" v-if="!syncing && (currentFilter !== '' || currentSearch !== '')">No message found</div>
        <div class="pannel-hint" v-if="syncing">Loading message list...</div>
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
      let sFolderFullName = this.$store.getters['mail/getСurrentFolderFullName']
      return sFolderFullName !== ''
    },
    folderName () {
      let oFolder = this.$store.getters['mail/getСurrentFolder']
      return oFolder ? oFolder.Name : ''
    },
    messages () {
      return this.$store.getters['mail/getСurrentMessages']
    },
    syncing () {
      return this.$store.getters['mail/getSyncing']
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
      let sFolderFullName = this.$store.getters['mail/getСurrentFolderFullName']
      this.$store.dispatch('mail/setCurrentFolder', sFolderFullName)
    },
  },
}
</script>
