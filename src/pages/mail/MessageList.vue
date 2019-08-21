<template>
  <div>
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
  data () {
    return {
    }
  },
  computed: {
    messages () {
      return this.$store.getters['mail/getСurrentMessages']
    },
  },
  mounted: function () {
  },
}
</script>
