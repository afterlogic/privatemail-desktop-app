<template>
  <div class="q-gutter-md">
    <div v-for="n in items" :key="n.id" class="q-my-md">
      <MessageListItem
        :subject="n.subject"
        :from="n.from"
      />
    </div>
  </div>
</template>

<style></style>

<script>
import MessageListItem from "components/MessageListItem"
import {messages} from "../data.js"


export default {
  name: "MessageList",
  components: {
    MessageListItem
  },
  data () {
    return {
      checkboxVal: false,
      items: []
    }
  },
  mounted: function () {
    this.items = messages;
  }
};
</script>
