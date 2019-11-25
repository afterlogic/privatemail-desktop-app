<template>
  <div v-if="!deleted">
    <q-item clickable v-ripple :class="{checked: checked, selected: selected, unread: !message.IsSeen}" @click="selectMessage" @dblclick="dblClickHandler">
      <q-item-section side class="items-center">
        <q-checkbox v-model="checked" />
        <q-icon name="star" color="orange" v-if="message.IsFlagged" @click.native.stop="toggleFlagged" />
        <q-icon name="star_border" color="orange" v-if="!message.IsFlagged && message.PartialFlagged" @click.native.stop="toggleFlagged" />
        <q-icon name="star_border" class="innactive_icon" v-if="!message.IsFlagged && !message.PartialFlagged" @click.native.stop="toggleFlagged" />
      </q-item-section>

      <q-item-section>
        <q-item-label lines="1">{{fromTo}}</q-item-label>
        <q-item-label lines="1" v-if="message.Subject">{{message.Subject}}</q-item-label>
        <q-item-label v-else lines="1" class="nodata">No subject</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-item-label>
          <q-icon flat name="attachment" style="font-size: 1.5em;" v-if="message.HasAttachments" />
          {{message.ShortDate}}
        </q-item-label>

        <q-chip v-if="message.Threads && message.Threads.length > 0" @click.native.stop="toggleThread" text-color="white" size="sm" :color="message.ThreadHasUnread ? 'primary-dark': 'primary'">
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
    <q-separator :class="{checked: checked, selected: selected, unread: !message.IsSeen}" />
    <div style="border-left: solid 5px #e3e3e3;" v-show="message.Threads && message.Threads.length > 0 && threadOpened">
      <MessageListItem v-for="threadMessage in message.Threads" :key="threadMessage.Uid" :message="threadMessage" />
    </div>
  </div>
</template>

<style lang="scss">
.unread {
  font-weight: bold;
  background: #fafafa;
}
hr.unread {
  background: #ddd;
}
</style>

<script>
import addressUtils from 'src/utils/address'

import messageUtils from 'src/modules/mail/utils/message.js'

export default {
  name: 'MessageListItem',
  props: [
    'message',
  ],
  data () {
    return {
      checked: false,
      threadOpened: false,
    }
  },
  watch: {
    checked: function () {
      this.$root.$emit('message-checked', this.message.Uid, this.checked)
      if (this.message.Threads && this.message.Threads.length > 0 && !this.threadOpened) {
        this.$emit('parent-message-checked', this.checked)
      }
    },
    deleted: function () {
      if (this.checked) {
        this.$root.$emit('message-checked', this.message.Uid, !this.deleted)
      }
    },
  },
  computed: {
    deleted () {
      return this.message.Deleted
    },
    fromTo () {
      let oFromTo = (this.message.Folder === 'Drafts' || this.message.Folder === 'Sent') ? this.message.To : this.message.From
      let aFromTo = []
      if (oFromTo && oFromTo['@Collection']) {
        _.each(oFromTo['@Collection'], function (address) {
          aFromTo.push(addressUtils.getFullEmail(address.DisplayName, address.Email))
        })
      }
      return aFromTo.join(', ')
    },
    selected () {
      return !!this.message && this.message.Uid === this.$store.getters['mail/getСurrentMessageUid']
    },
  },
  mounted: function () {
    this.initSubscriptions()
  },
  methods: {
    selectMessage: function () {
      this.$store.dispatch('mail/setCurrentMessage', this.message)
    },
    dblClickHandler: function () {
      let
        oCurrentFolderList = this.$store.getters['mail/getCurrentFolderList'],
        sDraftFolder = (oCurrentFolderList && oCurrentFolderList.Drafts) ? oCurrentFolderList.Drafts.FullName : ''

      if (this.message.Folder === sDraftFolder) {
        let
          oComposeParams = {
            aDraftInfo: this.message.DraftInfo,
            sDraftUid: this.message.Uid,
            sToAddr: messageUtils.getFullAddress(this.message.To),
            sCcAddr: messageUtils.getFullAddress(this.message.Cc),
            sBccAddr: messageUtils.getFullAddress(this.message.Bcc),
            sSubject: this.message.Subject,
            sText: this.message.Html ? this.message.Html : this.message.Plain,
            bPlainText: !this.message.Html && !!this.message.Plain,
            aAttachments: this.message.Attachments && _.isArray(this.message.Attachments['@Collection']) ? this.message.Attachments['@Collection'] : [],
            sInReplyTo: this.message.InReplyTo,
            sReferences: this.message.References,
          }
        this.openCompose(oComposeParams)
      }
    },
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
