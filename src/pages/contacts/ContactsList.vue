<template>
  <q-list>
    {{aCheckedList}}
    <!-- :class="{'selected': aCheckedList.find(contact.UUID)}" -->
    <div  v-for="contact in contacts.list" :key="contact.UUID">
    <!-- {{isChecked(contact.UUID)}} -->
      <q-item clickable v-ripple @click="getContactByUUID(contact.UUID)"
          @focus="isSelected(contact.UUID)" :class="{checked: isChecked(contact.UUID), selected: contact.UUID === selected }">
        <q-item-section side class="">
          <q-checkbox v-model="aCheckedList" :val="contact.UUID" />
        </q-item-section>
        <q-item-section>
          <q-item-label v-if="contact.FullName" lines="1">{{contact.FullName }}</q-item-label>
          <q-item-label v-else lines="1" class="contact-notext">No name</q-item-label>
          <q-item-label v-if="contact.ViewEmail" lines="2">{{contact.ViewEmail}}</q-item-label>
          <q-item-label v-else lines="2" class="contact-notext">No email address</q-item-label>
        </q-item-section>
      </q-item>
      <q-separator /> 
    </div>
  </q-list>
</template>

<style lang="scss" scoped>
/* .contact {
  /* padding: 8px 13px; */
/* }  */



hr.checked {
  background: #d6d6a9;
}
.checked {
  background: var(--q-color-t-selection-alt);
  
  // .q-checkbox {
  //   background: #fff;
  // }
}

.selected {
  background: var(--q-color-t-selection);
  color: #fff;  
}

hr.selected {
  background: #6d5d7e;
}

.contact-notext {
  color: #8c8989;
}
</style>

<script>
export default {
  name: 'ContactsList',
  props: ['allChecked', 'groupUUID'],
  data() {
    return {
      page: 1,
      perPage: 20,
      aCheckedList: [],
      selected: null,
    }
  },
  mounted: function() {
     
  },
  watch: {
    'currentStorage': function() {
      this.startAsyncGetContacts(true)
    },
    'currentGroupUUID': function() {
      this.startAsyncGetContacts(true)
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
        this.aCheckedList = aContactsUUIDsList
      } else {
        this.aCheckedList = []
      }
    },
    'aCheckedList': function() {
      if (this.aCheckedList.length === this.contacts.list.length) {
        this.$emit('allCheckChanged', true)
      } else if (this.aCheckedList.length === 0) {
        this.$emit('allCheckChanged', false)
      }

    },
    'groupUUID': function() {
      if (this.groupUUID) {
        let contactsToMoveInGroup = []
        this.aCheckedList.forEach(element => {
          let contact = _.find(this.contacts.list, element.UUID)
          contact ? contactsToMoveInGroup.push(contact) : null
        })

        if (contactsToMoveInGroup.length) {
          console.log(contactsToMoveInGroup)

        }

        
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
    selectItem() {
      this.selected = !this.selected
    },
    isChecked(UUID) {
      // console.log('isChecked', _.find(this.aCheckedList, (el) => el === UUID));
      return !!_.find(this.aCheckedList, (el) => el === UUID)
    },
    isSelected(UUID) {
      console.log('isChecked', _.find(this.aCheckedList, (el) => el === UUID));
      // return !!_.find(this.aCheckedList, (el) => el === UUID)
      this.selected = UUID
    },
  },
}
</script>
