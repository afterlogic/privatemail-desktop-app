<template>

  <div v-if="contact">
    <q-item-section >
      
      <q-item-label>{{ contact.FullName }}</q-item-label>
      <q-item-label caption lines="1">{{ contact.ViewEmail }}</q-item-label>
      <q-btn color="primary" label="Save this contact" />
      <q-btn color="primary" label="Email to this contact" />

      <q-item-label v-if="contact.FirstName">First name: {{ contact.FirstName }}</q-item-label>
      <q-btn color="primary" label="Edit contact" @click="enableEditContact"/>
      <q-item-label v-if="contact.LastName">Last name: {{ contact.LastName }}</q-item-label>
      <q-item-label v-if="contact.Skype">Skype: {{ contact.Skype }}</q-item-label>
      <q-item-label v-if="contact.Facebook">Facebook: {{ contact.Facebook }}</q-item-label>

      <q-item-label v-if="contact">Basic info</q-item-label>

      <q-item-label v-if="contact.PersonalEmail">Personal E-mail: {{ contact.PersonalEmail }}</q-item-label>
      <q-item-label v-if="contact.PersonalAddress">Personal Address: {{ contact.PersonalAddress }}</q-item-label>
      <q-item-label v-if="contact.PersonalCity">Personal City: {{ contact.PersonalCity }}</q-item-label>
      <q-item-label v-if="contact.PersonalState">Personal State: {{ contact.PersonalState }}</q-item-label>
      <q-item-label v-if="contact.PersonalCountry">Personal Country: {{ contact.PersonalCountry }}</q-item-label>
      <q-item-label v-if="contact.PersonalZip">Personal Zip: {{ contact.PersonalZip }}</q-item-label>
      <q-item-label v-if="contact.PersonalWeb">Personal Web: {{ contact.PersonalWeb }}</q-item-label>
      <q-item-label v-if="contact.PersonalFax">Personal Fax: {{ contact.PersonalFax }}</q-item-label>
      <q-item-label v-if="contact.PersonalPhone">Personal Phone: {{ contact.PersonalPhone }}</q-item-label>
      <q-item-label v-if="contact.PersonalMobile">Personal Mobile: {{ contact.PersonalMobile }}</q-item-label>

      <q-item-label v-if="contact">Business info</q-item-label>

      <q-item-label v-if="contact.BusinessEmail">Business E-mail: {{ contact.BusinessEmail }}</q-item-label>
      <q-item-label v-if="contact.BusinessCompany">Company: {{ contact.BusinessCompany }}</q-item-label>
      <q-item-label v-if="contact.BusinessDepartment">Department: {{ contact.BusinessDepartment }}</q-item-label>
      <q-item-label v-if="contact.BusinessJobTitle">Job Title: {{ contact.BusinessJobTitle }}</q-item-label>
      <q-item-label v-if="contact.BusinessOffice">Office: {{ contact.BusinessOffice }}</q-item-label>
      <q-item-label v-if="contact.BusinessAddress">Street Address: {{ contact.BusinessAddress }}</q-item-label>
      <q-item-label v-if="contact.BusinessCity">City: {{ contact.BusinessCity }}</q-item-label>
      <q-item-label v-if="contact.BusinessState">State/Province: {{ contact.BusinessState }}</q-item-label>
      <q-item-label v-if="contact.BusinessZip">Zip Code: {{ contact.BusinessZip }}</q-item-label>
      <q-item-label v-if="contact.BusinessCountry">Country/Region: {{ contact.BusinessCountry }}</q-item-label>
      <q-item-label v-if="contact.BusinessWeb">Web Page: {{ contact.BusinessWeb }}</q-item-label>
      <q-item-label v-if="contact.BusinessFax">Business Fax: {{ contact.BusinessFax }}</q-item-label>
      <q-item-label v-if="contact.BusinessPhone">Business Phone: {{ contact.BusinessPhone }}</q-item-label>

      <q-item-label v-if="contact">Other info</q-item-label>

      <q-item-label v-if="contact.BirthDay">Birthday: {{ contact.BirthDay }} {{ contact.BirthMonth }} {{ contact.BirthYear }}</q-item-label>
      <q-item-label v-if="contact.OtherEmail">Other E-mail: {{ contact.OtherEmail }}</q-item-label>
      <q-item-label v-if="contact.Notes">Notes: {{ contact.Notes }}</q-item-label>
    </q-item-section>
  </div>
</template>

<style></style>

<script>
import webApi from 'src/utils/webApi.js'
import CContact from 'src/modules/contacts/classes/CContact.js'

export default {
  name: 'ContactFields',
  data() {
    return {
      checkboxVal: false,
    }
  },

  mounted: function() {},
  watch: {},
  computed: {
    // contactByUUID() {
    //   return this.$store.getters['contacts/getContactByUUID']
    // },
    contact() {
      let ContactByUUID = this.$store.getters['contacts/getContactByUUID']
      let contact = ContactByUUID.contact

      return (contact && contact instanceof CContact) ? contact : null
    },
  },

  methods: {
    enableEditContact() {
      this.$store.dispatch('contacts/enableEditContact')
    },
  },
}
</script>
