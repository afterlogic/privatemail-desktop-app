<template>
  <q-list>
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
export default {
  name: 'ContactsList',
  data() {
    return {
      page: 1,
      perPage: 20,
      checkboxVal: false,
    }
  },

  mounted: function() {
    this.$store.dispatch('contacts/asyncGetStorages')
  },

  watch: {
    currentStorage: function() {
      this.startAsyncGetContacts()
    },
    hasChanges: function () {
      if (this.hasChanges) {
        this.startAsyncGetContacts()
      }
    },
  },

  computed: {
    hasChanges() {
      return this.$store.getters['contacts/getHasChanges']
    },
    contacts() {
      return this.$store.getters['contacts/getContacts']
    },
    currentStorage() {
      return this.$store.getters['contacts/getCurrentStorage']
    },
  },

  methods: {
    startAsyncGetContacts () {
      this.$store.dispatch('contacts/asyncGetContacts', { iPage: this.page, iPerPage: this.perPage })
    },
    getContactByUUID(UUID) {
      this.$store.dispatch('contacts/getContactByUUID', UUID)
      console.log(UUID)
    },
  },
}
</script>
