<template>
  <div>
    <MessageListItem v-for="message in messages" :key="message.Uid" :message="message" />
    <div v-if="messages.length === 0 && !syncing">The folder is empty</div>
    <div v-if="messages.length === 0 && syncing">Loading message list...</div>
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
  data () {
    return {
    }
  },
  computed: {
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
