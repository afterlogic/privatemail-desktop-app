<template>
  <q-list>
    {{checkboxVal}}
    <!-- :class="{'selected': checkboxVal.find(contact.UUID)}" -->
    <div v-for="contact in contacts.list" :key="contact.UUID" >
      <q-item clickable v-ripple class="checked" @click="getContactByUUID(contact.UUID)" >
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
  props: ['allChecked'],
  data() {
    return {
      checkboxVal: [],
      //allChecked: this.allChecked,
    }
  },

  watch: {
    'currentStorage': function() {
      this.startAsyncGetContacts(true)
    },
    'currentGroupUUID': function() {
      this.startAsyncGetContacts(true)
    },
    'currentPage': function() {
      this.startAsyncGetContacts(false)
    },
    'hasChanges': function () {
      if (this.hasChanges) {
        this.startAsyncGetContacts(false)
      }
    },
    'allChecked': function() {
      if (this.allChecked) {
        let aContactsUUIDsList = []
        this.contacts.list.forEach(element => {
          aContactsUUIDsList.push(element.UUID)
        }); 
        this.checkboxVal = aContactsUUIDsList
      } else {
        this.checkboxVal = []
      }
    },
    'checkboxVal': function() {
      if (this.checkboxVal.length === this.contacts.list.length) {
        this.$emit('allCheckChanged', true)
      } else if (this.checkboxVal.length === 0) {
        this.$emit('allCheckChanged', false)
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
    currentPage () {
      return this.$store.getters['contacts/getСurrentPage']
    },
  },

  methods: {
    startAsyncGetContacts (bResetPage) {
      if (bResetPage) {
        this.$store.commit('contacts/setCurrentPage', 1)
      }
      this.$store.dispatch('contacts/asyncGetContacts')
    },
    getContactByUUID(UUID) {
      this.$store.dispatch('contacts/getContactByUUID', UUID)
      console.log(UUID)
    },
  },
}
</script>
