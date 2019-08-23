<template>
  <q-toolbar>
    <q-btn flat color="primary" icon="drafts" @click="markAsRead" />
    <q-btn flat color="primary" icon="code" align="right" @click="swithTheme()"/>
    <q-btn flat color="primary" icon="done" @click="swithTheme1()" />
    <q-btn flat color="primary" icon="mail_outline" />
    <q-btn flat color="primary" icon="delete_outline" />
    <q-chip v-if="checkedCount > 0" class="checkedCount" dense color="primary">{{checkedCount}}</q-chip>
    <q-btn flat color="primary" label="Show Notification" @click="showNotif()" />
    <q-space/>
    <q-btn flat color="primary" icon="sync" @click="sync" v-if="!mailSyncing" />
    <q-spinner color="primary" size="1.5em" @click="sync" v-if="mailSyncing"></q-spinner>
    <!-- <q-btn flat color="primary" label="Flat" /> -->
  </q-toolbar>
</template>

<style>
.checkedCount {
  color: white;
}
</style>

<script>
import { colors } from 'quasar'

const alerts = [
  { color: 'negative', message: 'Woah! Danger! You are getting good at this!', icon: 'report_problem' },
  { message: 'You need to know about this!', icon: 'warning' },
  { message: 'Wow! Nice job!', icon: 'thumb_up' },
  { color: 'teal', message: 'Quasar is cool! Right?', icon: 'tag_faces' },
  { color: 'purple', message: 'Jim just pinged you', avatar: 'https://cdn.quasar.dev/img/boy-avatar.png' },
  { multiLine: true, message: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Hic quisquam non ad sit assumenda consequuntur esse inventore officia. Corrupti reiciendis impedit vel, fugit odit quisquam quae porro exercitationem eveniet quasi.' }
]

export default {
  name: "MailListToolbar",
  props: {
    checkedMessagesUids: Array
  },
  data () {
    return {
    }
  },
  computed: {
    mailSyncing () {
      return this.$store.getters['mail/getSyncing']
    },
    checkedCount () {
      return this.checkedMessagesUids.length
    },
  },
  methods: {
    markAsRead () {
      this.$store.dispatch('mail/setMessagesRead', {
        Uids: this.checkedMessagesUids,
        IsSeen: true,
      })
    },
    sync () {
      this.$store.dispatch('mail/asyncGetFoldersRelevantInformation')
    },
    swithTheme () {
      colors.setBrand('primary', '#000')
    },
    swithTheme1 () {
      colors.setBrand('primary', '#f00')
    },
    showNotif () {
      const position = 'top-right'
      const { color, textColor, multiLine, icon, message, avatar } = alerts[ Math.floor(Math.random(alerts.length) * 10) % alerts.length ]
      const random = Math.random() * 100

      const twoActions = random > 70
      const buttonColor = color ? 'white' : void 0

      this.$q.notify({
        color,
        textColor,
        icon: random > 30 ? icon : null,
        message,
        position,
        avatar,
        multiLine,
        actions: twoActions
          ? [
            { label: 'Reply', color: buttonColor, handler: () => console.log('wooow') },
            { label: 'Dismiss', color: 'yellow', handler: () => console.log('wooow') }
          ]
          : (random > 40
            ? [ { label: 'Reply', color: buttonColor, handler: () => console.log('wooow') } ]
            : null
          ),
        timeout: Math.random() * 5000 + 3000
      })
    },
  }
};
</script>
