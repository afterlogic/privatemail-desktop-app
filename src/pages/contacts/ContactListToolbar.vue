<template>
  <q-toolbar>
    <q-btn flat color="primary" icon="group_add" />
    <q-btn flat color="primary" icon="mail_outline" />
    <q-btn-dropdown flat color="primary" icon="folder_open">
      <q-list>
        <q-item clickable v-ripple v-for="group in groupsList" :key="group.id">
          <q-item-section>{{group.name}}</q-item-section>
        </q-item>
        <q-item clickable v-ripple>
          <q-item-section>- New group -</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <q-btn flat color="primary" icon="delete_outline" />
    <q-btn-dropdown flat color="primary" icon="import_export">
      <q-list>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Export as CSV</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Export as VCF</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Import</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <q-space/>
    <q-btn flat color="primary" icon="sync" />
    <!-- <q-btn flat color="primary" label="Flat" /> -->
  </q-toolbar>
</template>

<style></style>

<script>
import { colors } from 'quasar'
import {groups} from "../../contactsData.js"

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
  components: {
  },
  data () {
    return {
      groupsList: []
    }
  },
  mounted: function () {
    this.groupsList = groups;
  },
  methods: {
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
    }
  }
};
</script>
