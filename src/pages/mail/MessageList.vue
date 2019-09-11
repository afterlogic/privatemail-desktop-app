<template>
  <div>
    <MessageListItem v-for="message in messages" :key="message.Uid" :message="message" />
    <template v-if="folderSelected">
      <template v-if="messages.length === 0">
        <div v-if="!syncing">The folder is empty</div>
        <div v-if="syncing">Loading message list...</div>
      </template>
    </template>
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
    messages () {
      return this.$store.getters['mail/getСurrentMessages']
    },
    syncing () {
      return this.$store.getters['mail/getSyncing']
    },
  },
  mounted: function () {
  },
}
</script>
