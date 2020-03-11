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
        <q-item-label lines="1" class="text-body2">{{fromTo}}</q-item-label>
        <q-item-label lines="1" v-if="message.Subject" class="text-body1">{{message.Subject}}</q-item-label>
        <q-item-label v-else lines="1" class="nodata text-body1 non-selectable">No subject</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label class="email-markers" :class="{'answered': message.IsAnswered, 'forwarded': message.IsForwarded}" v-if="message.IsAnswered || message.IsForwarded">
          <q-icon flat color="white" name="reply" v-if="message.IsAnswered && !message.IsForwarded"  />
          <q-icon flat color="white" name="forward" v-if="!message.IsAnswered && message.IsForwarded" />
          <q-icon flat color="white" name="sync" v-if="message.IsAnswered && message.IsForwarded"  />
        </q-item-label>

        <q-item-label>
          <q-icon flat name="attachment" class="q-mr-md text-weight-thin" style="font-size: 1.5em;" v-if="message.HasAttachments" />
          <span class="text-caption">{{ shortDate }}</span>
        </q-item-label>

        <q-chip v-if="message.Threads && message.Threads.length > 0" @click.native.stop="toggleThread" :text-color="message.ThreadHasUnread ? 'white' : 'black'" size="sm" :color="message.ThreadHasUnread ? 'primary': 'primary-dark'">
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
  background: #fafafa;
  .text-body1,
  .text-body2 {
    font-weight: bold;
  }
}
hr.unread {
  background: #ddd;
}

.email-markers {
    position: absolute; top: 0px; right: 0px;

    &::before {
        content: "";
        display: block;
        position: absolute;
        border-right: 30px solid red;
        border-bottom: 30px solid transparent;
        right: 0px;
        top: 0px;
    }

    &.answered::before {
        border-right-color: #57ce57;
    }
    &.forwarded::before {
        border-right-color: #e4be36;
    }   
    &.forwarded.answered::before {
        border-right-color: #f18c6e;
    }
}
</style>

<script>
import addressUtils from 'src/utils/address'
import dateUtils from 'src/utils/date'
import typesUtils from 'src/utils/types.js'

import composeUtils from 'src/modules/mail/utils/compose.js'
import mailEnums from 'src/modules/mail/enums.js'
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
        if (this.message.Threads && this.message.Threads.length > 0) {
          _.each(this.message.Threads, (oThreadMessage) => {
            if (oThreadMessage.Deleted) {
              this.$root.$emit('message-checked', oThreadMessage.Uid, false)
            }
          })
        }
      }
    },
  },
  computed: {
    deleted () {
      return this.message.Deleted
    },
    fromTo () {
      let oFolder = this.$store.getters['mail/getFolderByFullName'](this.message.Folder)
      let aAddressesCollection = []
      if (oFolder && (oFolder.Type === mailEnums.FolderType.Drafts || oFolder.Type === mailEnums.FolderType.Sent)) {
        if (this.message.To && _.isArray(this.message.To['@Collection'])) {
          aAddressesCollection = this.message.To['@Collection']
        }
      } else {
        if (this.message.From && _.isArray(this.message.From['@Collection'])) {
          aAddressesCollection = this.message.From['@Collection']
        }
      }

      let sCurrentAccountEmail = this.$store.getters['mail/getCurrentAccountEmail']

      return _.map(aAddressesCollection, function (oAddress) {
        if (sCurrentAccountEmail === oAddress.Email) {
          return 'me'
        }
        if (typesUtils.isNonEmptyString(oAddress.DisplayName)) {
          return oAddress.DisplayName
        }
        return oAddress.Email
      }).join(', ')
    },
    selected () {
      return !!this.message && this.message.Uid === this.$store.getters['mail/getCurrentMessageUid']
    },
    shortDate () {
      return dateUtils.getShortDate(this.message.TimeStampInUTC, false)
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
        let aFromAddresses = _.isArray(this.message.From['@Collection']) ? this.message.From['@Collection'] : []
        let oComposeParams = {
          aDraftInfo: this.message.DraftInfo,
          sDraftUid: this.message.Uid,
          oIdentity: composeUtils.getIdentityForCompose(aFromAddresses),
          aToContacts: messageUtils.getContactsToSend(this.message.To),
          aCcContacts: messageUtils.getContactsToSend(this.message.Cc),
          aBccContacts: messageUtils.getContactsToSend(this.message.Bcc),
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
      this.$store.dispatch('mail/asyncSetMessageFlagged', {
        sUid: this.message.Uid,
        bFlagged: !this.message.IsFlagged,
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
