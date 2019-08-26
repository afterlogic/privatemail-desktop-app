<template>
  <div>
    <q-item clickable v-ripple :class="{checked: checked, active: active, unread: !this.message.IsSeen}">
      <q-item-section side class="items-center">
        <q-checkbox v-model="checked" />
        <q-icon name="star" color="orange" v-if="message.IsFlagged" @click.native="toggleFlagged" />
        <q-icon name="star_border" color="orange" v-if="!message.IsFlagged && message.PartialFlagged" @click.native="toggleFlagged" />
        <q-icon name="star_border" color="grey" v-if="!message.IsFlagged && !message.PartialFlagged" @click.native="toggleFlagged" />
      </q-item-section>

      <q-item-section @click="active = !active">
        <q-item-label lines="1">{{fromTo}}</q-item-label>
        <q-item-label lines="2">{{message.Subject}}</q-item-label>
      </q-item-section>
      <q-item-section style="flex: auto;" v-if="message.HasAttachments">
        <q-icon lines="1" flat name="attachment" style="font-size: 1.5em;" />
      </q-item-section>
      <q-item-section style="flex: auto;">
        <q-item-label lines="1">{{message.ShortDate}}</q-item-label>
        <q-chip lines="2" dense v-if="message.Threads.length > 0" @click.native="toggleThread" :color="message.ThreadHasUnread ? 'grey': ''">
          {{message.Threads.length}}
          <q-tooltip v-if="!threadOpened && !message.ThreadHasUnread">
            Unfold thread
          </q-tooltip>
          <q-tooltip v-if="threadOpened">
            Fold thread
          </q-tooltip>
          <q-tooltip v-if="!threadOpened && message.ThreadHasUnread">
            This thread has unread message
          </q-tooltip>
        </q-chip>
      </q-item-section>
    </q-item>
    <q-separator :class="{checked: checked, active: active, unread: !this.message.IsSeen}" />
    <div style="border-left: solid 5px #e3e3e3;" v-show="message.Threads.length > 0 && threadOpened">
      <MessageListItem v-for="threadMessage in message.Threads" :key="threadMessage.Uid" :message="threadMessage" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.unread {
  font-weight: bold;
  background: #fafafa;
}
hr.unread {
  background: #ddd;
}
.checked {
  background: var(--q-color-t-selection-alt);
}
hr.checked {
  background: #d6d6a9;
}
.active {
  background: var(--q-color-t-selection);
  color: #fff;

  .q-icon {
    color: #fff;
  }
}
hr.active {
  background: #6d5d7e;
}
</style>

<script>
import addressUtils from 'src/utils/address'

export default {
  name: 'MessageListItem',
  props: [
    'message',
  ],
  data () {
    return {
      active: false,
      checked: false,
      threadOpened: false,
    }
  },
  watch: {
    checked: function () {
      this.$root.$emit('message-checked', this.message.Uid, this.checked)
      if (this.message.Threads.length > 0 && !this.threadOpened) {
        this.$emit('parent-message-checked', this.checked)
      }
    },
  },
  computed: {
    fromTo () {
      var oFromTo = (this.message.Folder === 'Drafts' || this.message.Folder === 'Sent') ? this.message.To : this.message.From
      var aFromTo = []
      _.each(oFromTo['@Collection'], function (address) {
        aFromTo.push(addressUtils.getFullEmail(address.DisplayName, address.Email))
      })
      return aFromTo.join(', ')
    },
  },
  mounted: function () {
    this.initSubscriptions()
  },
  methods: {
    toggleFlagged: function () {
      this.$store.dispatch('mail/setMessageFlagged', {
        Uid: this.message.Uid,
        Flagged: !this.message.IsFlagged,
      })
    },
    toggleThread: function () {
      this.threadOpened = !this.threadOpened
    },
    onCheckAllMessages (bChecked) {
      this.checked = bChecked
    },
    onParentMessageChecked (bChecked) {
      this.checked = bChecked
    },
    initSubscriptions () {
      this.$root.$on('check-all-messages', this.onCheckAllMessages)
      this.$parent.$on('parent-message-checked', this.onParentMessageChecked)
    },
    destroySubscriptions () {
      this.$root.$off('check-all-messages', this.onCheckAllMessages)
      this.$parent.$off('parent-message-checked', this.onParentMessageChecked)
    },
  },
  beforeDestroy() {
    this.destroySubscriptions()
  },
}
</script>
