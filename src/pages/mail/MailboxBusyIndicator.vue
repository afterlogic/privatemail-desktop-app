<template>
  <div v-if="userSpace">
    <div v-if="page === 'mail'" class="progress-bar-prompt q-px-lg">
      <router-link :to="'/settings/accounts/account/' + currentAccountId + '/folders'" class="text-primary">Manage folders</router-link>
    </div>
    <div class="progress-bar q-px-lg">
      <div class="progress-bar-container">
        <div class="progress-bar-line bg-primary" :style="{width: `${mailboxBusy}%`}"></div>
      </div>
      <br>
    </div>
    <div class="text-primary progress-bar-prompt q-px-lg q-mb-xs">You are using {{mailboxBusy}}% of your {{mailBoxMemory}}</div>
  </div>
</template>

<style scoped>
.progress-bar {
  display: flex;
  align-items: center;
}
.progress-bar-container {
  height: 10px;
  width: 100%;
  background-color: transparent;
  padding: 2px 4px 2px 4px;
  border: 1px solid #bc4799;
  border-radius: 15px;
}

.progress-bar-line {
  overflow:hidden;
  width: 0;
  height: 4px;
}
.progress-bar-prompt {
  text-align: center;
  font-size: 12px
}
</style>

<script>
import text from '../../utils/text'

export default {
  name: 'MailboxBusyIndicator',
  props: {
    page: {
      type: String,
      default: 'mail'
    }
  },
  data () {
    return {
    }
  },
  computed: {
    userSpace() {
      let accountQuota = this.$store.getters[`${this.page}/getAccountQuota`]
      if (this.page === 'mail') {
        if (accountQuota?.length) {
          return accountQuota[1]
        }
        return 0
      }
      if (this.page === 'files') {
        return this.$store.getters['files/getFilesQuota'].limit
      }
      return 0
    },
    currentAccountId() {
      return this.$store.getters[`mail/getCurrentAccountId`]
    },
    busyMemory() {
      if (this.page === 'mail') {
        let accountQuota = this.$store.getters[`mail/getAccountQuota`]
        if (accountQuota?.length) {
          return accountQuota[0]
        }
        return 0
      }
     if (this.page === 'files') {
       return this.$store.getters['files/getFilesQuota'].used
     }
     return 0
    },
    mailboxBusy() {
      if (this.busyMemory && this.userSpace) {
        return Math.ceil(this.busyMemory / this.userSpace * 100)
      }
      return 0
    },
    mailBoxMemory() {
      let userSpace = 0
      if (this.page === 'mail') {
       userSpace = this.userSpace * 1024
      }
      if (this.page === 'files') {
       userSpace = this.userSpace
      }
      return text.getFriendlySize(userSpace)
    }
  },
}
</script>

