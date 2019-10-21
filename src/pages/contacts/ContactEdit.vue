<template>
  <div>
    <div v-if="contact">
      <q-item-section >
        <q-input outlined v-model="contact.FullName" :dense=true />
        <q-input outlined v-model="contact.ViewEmail" :dense=true caption lines="1"></q-input>

        <q-input outlined v-model="contact.FirstName" :dense=true v-if="contact.FirstName">First name: </q-input>
        <q-btn color="primary" label="Edit contact" />
        <q-input outlined v-model="contact.LastName" :dense=true value="asda" v-if="contact.LastName">Last name: </q-input>
        <q-input outlined v-model="contact.Skype" :dense=true v-if="contact.Skype">Skype: </q-input>
        <q-input outlined v-model="contact.Facebook" :dense=true v-if="contact.Facebook">Facebook: </q-input>

        <q-input outlined :dense=true v-if="contact">Basic info</q-input>

        <q-input outlined v-model="contact.PersonalEmail" :dense=true v-if="contact.PersonalEmail">Personal E-mail: </q-input>
        <q-input outlined v-model="contact.PersonalAddress" :dense=true v-if="contact.PersonalAddress">Personal Address: </q-input>
        <q-input outlined v-model="contact.PersonalCity" :dense=true v-if="contact.PersonalCity">Personal City: </q-input>
        <q-input outlined v-model="contact.PersonalState" :dense=true v-if="contact.PersonalState">Personal State: </q-input>
        <q-input outlined v-model="contact.PersonalCountry" :dense=true v-if="contact.PersonalCountry">Personal Country: </q-input>
        <q-input outlined v-model="contact.PersonalZip" :dense=true v-if="contact.PersonalZip">Personal Zip: </q-input>
        <q-input outlined v-model="contact.PersonalWeb" :dense=true v-if="contact.PersonalWeb">Personal Web: </q-input>
        <q-input outlined v-model="contact.PersonalFax" :dense=true v-if="contact.PersonalFax">Personal Fax: </q-input>
        <q-input outlined v-model="contact.PersonalPhone" :dense=true v-if="contact.PersonalPhone">Personal Phone: </q-input>
        <q-input outlined v-model="contact.PersonalMobile" :dense=true v-if="contact.PersonalMobile">Personal Mobile: </q-input>

        <q-input outlined :dense=true v-if="contact">Business info</q-input>

        <q-input outlined v-model="contact.BusinessEmail" :dense=true v-if="contact.BusinessEmail">Business E-mail: </q-input>
        <q-input outlined v-model="contact.BusinessCompany" :dense=true v-if="contact.BusinessCompany">Company:</q-input>
        <q-input outlined v-model="contact.BusinessDepartment" :dense=true v-if="contact.BusinessDepartment">Department: </q-input>
        <q-input outlined v-model="contact.BusinessJobTitle" :dense=true v-if="contact.BusinessJobTitle">Job Title: </q-input>
        <q-input outlined v-model="contact.BusinessOffice" :dense=true v-if="contact.BusinessOffice">Office: </q-input>
        <q-input outlined v-model="contact.BusinessAddress" :dense=true v-if="contact.BusinessAddress">Street Address: </q-input>
        <q-input outlined v-model="contact.BusinessCity" :dense=true v-if="contact.BusinessCity">City: </q-input>
        <q-input outlined v-model="contact.BusinessState" :dense=true v-if="contact.BusinessState">State/Province: </q-input>
        <q-input outlined v-model="contact.BusinessZip" :dense=true v-if="contact.BusinessZip">Zip Code: </q-input>
        <q-input outlined v-model="contact.BusinessCountry" :dense=true v-if="contact.BusinessCountry">Country/Region: </q-input>
        <q-input outlined v-model="contact.BusinessWeb" :dense=true v-if="contact.BusinessWeb">Web Page:</q-input>
        <q-input outlined v-model="contact.BusinessFax" :dense=true v-if="contact.BusinessFax">Business Fax: </q-input>
        <q-input outlined v-model="contact.BusinessPhone" :dense=true v-if="contact.BusinessPhone">Business Phone: </q-input>

        <q-input outlined :dense=true v-if="contact">Other info</q-input>

        <q-input outlined v-model="contact.BirthDay" :dense=true v-if="contact.BirthDay">Birthday: {{ contact.BirthDay }} {{ contact.BirthMonth }} {{ contact.BirthYear }}</q-input>
        <q-input outlined v-model="contact.OtherEmail" :dense=true v-if="contact.OtherEmail">Other E-mail: </q-input>
        <q-input outlined v-model="contact.Notes" :dense=true v-if="contact.Notes">Notes: </q-input>
      </q-item-section>
      <q-btn color="primary" label="Save" />
      <q-btn color="primary" label="Cancel" @click="disableEditContact"/>
    </div>
  </div>
</template>

<style></style>

<script>
import webApi from 'src/utils/webApi.js'
import CContact from 'src/modules/contacts/classes/CContact.js'

export default {
  name: 'ContactEdit',
  data() {
    return {
      checkboxVal: false
    }
  },

  mounted: function() {
    
  },
  watch: {
  },
  computed: {
    contact() {
      let ContactByUUID = this.$store.getters['contacts/getContactByUUID']
      let contact = ContactByUUID.contact
    
      return (contact && contact instanceof CContact) ? contact : null
    }
  },

  methods: {
    onSave () {
        let ContactByUUID = this.$store.getters['contacts/getContactByUUID']
        let contactSource = ContactByUUID.contact

        this.contact === contactSource

        //performe save request 
    },
    disableEditContact() {
      this.$store.dispatch('contacts/disableEditContact')
    }
  },
}
</script>
