<template>
  <div>
      <MessageListItem
        v-for="n in items" :key="n.id"
        :subject="n.subject"
        :from="n.from"
      />
  </div>
</template>

<style></style>

<script>
import MessageListItem from "./MessageListItem"
import {messages} from "../../data.js"


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
