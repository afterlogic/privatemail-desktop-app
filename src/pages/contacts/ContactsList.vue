<template>
  <q-list>
    {{checkboxVal}}
    <div v-for="contact in contacts.list" :key="contact.UUID" >
      <q-item clickable v-ripple class="checked" @click="getContactByUUID(contact.UUID)" :class="{'selected': checkboxVal.find(contact.UUID)}">
        <q-item-section side class="items-center">
          <q-checkbox v-model="checkboxVal" :val="contact.UUID" />
        </q-item-section>
        <q-item-section>
          <q-item-label lines="1">{{ contact.FullName !== '' ? contact.FullName : 'No name' }}</q-item-label>
          <q-item-label lines="2">{{ contact.ViewEmail !== '' ? contact.ViewEmail : 'No email address' }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-separator />
    </div>
  </q-list>
</template>

<style >
hr.checked {
  background: #d6d6a9;
}

hr.selected {
  background: #6d5d7e;
}
</style>

<script>
export default {
  name: 'ContactsList',

  data() {
    return {
      page: 1,
      perPage: 20,
      checkboxVal: [],
    }
  },

  watch: {
    currentStorage: function() {
      this.startAsyncGetContacts(true)
    },
    currentGroupUUID: function() {
      this.startAsyncGetContacts(true)
    },
    hasChanges: function () {
      if (this.hasChanges) {
        this.startAsyncGetContacts(false)
      }
    },
  },

  computed: {
    currentStorage() {
      return this.$store.getters['contacts/getCurrentStorage']
    },
    currentGroupUUID() {
      return this.$store.getters['contacts/getCurrentGroupUUID']
    },
    hasChanges() {
      return this.$store.getters['contacts/getHasChanges']
    },
    contacts() {
      return this.$store.getters['contacts/getContacts']
    },
  },

  methods: {
    startAsyncGetContacts (bResetPage) {
      this.page = 1
      this.$store.dispatch('contacts/asyncGetContacts', { iPage: this.page, iPerPage: this.perPage })
    },
    getContactByUUID(UUID) {
      this.$store.dispatch('contacts/getContactByUUID', UUID)
      console.log(UUID)
    },
  },
}
</script>
