<template>

  <div v-if="contactByUUID.UUID">
    <q-item-section >
      
      <q-item-label>{{ contactByUUID.contact.FullName }}</q-item-label>
      <q-item-label caption lines="1">{{ contactByUUID.contact.ViewEmail }}</q-item-label>
      <q-btn color="primary" label="Save this contact" />
      <q-btn color="primary" label="Email to this contact" />

      <q-item-label v-if="contactByUUID.contact.FirstName">First name: {{ contactByUUID.contact.FirstName }}</q-item-label>
      <q-btn color="primary" label="Edit contact" />
      <q-item-label v-if="contactByUUID.contact.LastName">Last name: {{ contactByUUID.contact.LastName }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.Skype">Skype: {{ contactByUUID.contact.Skype }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.Facebook">Facebook: {{ contactByUUID.contact.Facebook }}</q-item-label>

      <q-item-label v-if="contactByUUID.contact">Basic info</q-item-label>

      <q-item-label v-if="contactByUUID.contact.PersonalEmail">Personal E-mail: {{ contactByUUID.contact.PersonalEmail }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.PersonalAddress">Personal Address: {{ contactByUUID.contact.PersonalAddress }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.PersonalCity">Personal City: {{ contactByUUID.contact.PersonalCity }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.PersonalState">Personal State: {{ contactByUUID.contact.PersonalState }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.PersonalCountry">Personal Country: {{ contactByUUID.contact.PersonalCountry }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.PersonalZip">Personal Zip: {{ contactByUUID.contact.PersonalZip }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.PersonalWeb">Personal Web: {{ contactByUUID.contact.PersonalWeb }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.PersonalFax">Personal Fax: {{ contactByUUID.contact.PersonalFax }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.PersonalPhone">Personal Phone: {{ contactByUUID.contact.PersonalPhone }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.PersonalMobile">Personal Mobile: {{ contactByUUID.contact.PersonalMobile }}</q-item-label>

      <q-item-label v-if="contactByUUID.contact">Business info</q-item-label>

      <q-item-label v-if="contactByUUID.contact.BusinessEmail">Business E-mail: {{ contactByUUID.contact.BusinessEmail }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.BusinessCompany">Company: {{ contactByUUID.contact.BusinessCompany }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.BusinessDepartment">Department: {{ contactByUUID.contact.BusinessDepartment }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.BusinessJobTitle">Job Title: {{ contactByUUID.contact.BusinessJobTitle }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.BusinessOffice">Office: {{ contactByUUID.contact.BusinessOffice }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.BusinessAddress">Street Address: {{ contactByUUID.contact.BusinessAddress }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.BusinessCity">City: {{ contactByUUID.contact.BusinessCity }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.BusinessState">State/Province: {{ contactByUUID.contact.BusinessState }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.BusinessZip">Zip Code: {{ contactByUUID.contact.BusinessZip }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.BusinessCountry">Country/Region: {{ contactByUUID.contact.BusinessCountry }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.BusinessWeb">Web Page: {{ contactByUUID.contact.BusinessWeb }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.BusinessFax">Business Fax: {{ contactByUUID.contact.BusinessFax }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.BusinessPhone">Business Phone: {{ contactByUUID.contact.BusinessPhone }}</q-item-label>

      <q-item-label v-if="contactByUUID.contact">Other info</q-item-label>

      <q-item-label v-if="contactByUUID.contact.BirthDay">Birthday: {{ contactByUUID.contact.BirthDay }} {{ contactByUUID.contact.BirthMonth }} {{ contactByUUID.contact.BirthYear }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.OtherEmail">Other E-mail: {{ contactByUUID.contact.OtherEmail }}</q-item-label>
      <q-item-label v-if="contactByUUID.contact.Notes">Notes: {{ contactByUUID.contact.Notes }}</q-item-label>
    </q-item-section>
  </div>
</template>

<style></style>

<script>
//import {contacts, contactsOffline} from "../../contactsData.js"
import webApi from "src/utils/webApi.js";

export default {
  name: "ContactFields",
  data() {
    return {
      checkboxVal: false
    };
  },

  mounted: function() {},
  watch: {},
  computed: {
    contactByUUID() {
      return this.$store.getters["contacts/getContactByUUID"];
    }
  },

  methods: {}
};
</script>
