<template>
  <q-list>
    <!-- {{ contactsInfo }}
     {{ cTag }}
    {{ contacts }} -->

    <q-item v-for="contact in contacts.list" :key="contact.UUID" class="q-my-sm" clickable @click="getContactByUUID(contact.UUID)" v-ripple>
      <!-- <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            {{ contact.Letter }}
          </q-avatar>
      </q-item-section>-->

      <q-checkbox v-model="checkboxVal" />

      <q-item-section >
        <q-item-label>{{ contact.FullName }}</q-item-label>
        <q-item-label caption lines="1">{{ contact.ViewEmail }}</q-item-label>
      </q-item-section>

      <!-- <q-item-section side>
          <q-icon name="chat_bubble" color="green" />
      </q-item-section>-->
    </q-item>

    <!-- <q-separator />
    <q-item-label header>Offline</q-item-label>-->

    <!-- <q-item v-for="contact in contactsOfflineList" :key="contact.id" class="q-mb-sm" clickable v-ripple>
        <q-item-section avatar>
          <q-avatar>
            <img :src="`https://cdn.quasar.dev/img/${contact.avatar}`">
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ contact.name }}</q-item-label>
          <q-item-label caption lines="1">{{ contact.email }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-icon name="chat_bubble" color="grey" />
        </q-item-section>
    </q-item>-->
  </q-list>
</template>

<style></style>

<script>
//import {contacts, contactsOffline} from "../../contactsData.js"
import webApi from "src/utils/webApi.js"

export default {
  name: "ContactsList",
  data() {
    return {
      checkboxVal: false
    }
  },

  mounted: function() {
    this.refreshStoragesList()
  },
  watch: {
    storageList: function(val, oldVal) {
      this.refreshContactsInfo()
    },
    storage: function(val, oldVal) {
      this.refreshContactsInfo()
    },
    contactsInfo: function(val, oldVal) {
      this.refreshContactsByUids()
    }
  },
  computed: {
    storageList() {
      return this.$store.getters["contacts/getStorages"]
    },

    contactsInfo() {
      return this.$store.getters["contacts/getContactsInfo"]
    },

    cTag() {
      return this.$store.getters["contacts/getCTag"]
    },

    contacts() {
      return this.$store.getters["contacts/getContactsByUids"]
    },

    storage() {
      return this.$store.getters["contacts/getStorage"]
    },

    // UUID() {
    //   return this.$store.getters["contacts/getContactByUUID"]
    // },
  },

  methods: {
    refreshStoragesList() {
      this.$store.dispatch("contacts/asyncGetStorages")
    },
    refreshContactsInfo() {
      this.$store.dispatch("contacts/asyncGetContactsInfo")
    },
    refreshContactsByUids() {
      this.$store.dispatch("contacts/asyncGetContactsByUids")
    },
    getContactByUUID(UUID) {
      this.$store.dispatch("contacts/getContactByUUID", UUID)
      console.log(UUID)
    },

    // watcher () {
    //   if ( this.storageList.length ) {

    //   }
    // }

  }
}
</script>
