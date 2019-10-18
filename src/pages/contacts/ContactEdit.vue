<template>

  <div v-if="contactByUUID.UUID">
    <q-item-section >
      <q-input outlined v-model="searchText" :dense=true value="" />
      <q-input outlined v-model="searchText" :dense=true value="">{{ contactByUUID.contact.FullName }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" caption lines="1">{{ contactByUUID.contact.ViewEmail }}</q-input>
      <q-btn color="primary" label="Save this contact" />
      <q-btn color="primary" label="Email to this contact" />

      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.FirstName">First name: {{ contactByUUID.contact.FirstName }}</q-input>
      <q-btn color="primary" label="Edit contact" />
      <q-input outlined v-model="searchText" :dense=true value="asda" v-if="contactByUUID.contact.LastName">Last name: {{ contactByUUID.contact.LastName }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.Skype">Skype: {{ contactByUUID.contact.Skype }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.Facebook">Facebook: {{ contactByUUID.contact.Facebook }}</q-input>

      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact">Basic info</q-input>

      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.PersonalEmail">Personal E-mail: {{ contactByUUID.contact.PersonalEmail }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.PersonalAddress">Personal Address: {{ contactByUUID.contact.PersonalAddress }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.PersonalCity">Personal City: {{ contactByUUID.contact.PersonalCity }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.PersonalState">Personal State: {{ contactByUUID.contact.PersonalState }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.PersonalCountry">Personal Country: {{ contactByUUID.contact.PersonalCountry }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.PersonalZip">Personal Zip: {{ contactByUUID.contact.PersonalZip }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.PersonalWeb">Personal Web: {{ contactByUUID.contact.PersonalWeb }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.PersonalFax">Personal Fax: {{ contactByUUID.contact.PersonalFax }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.PersonalPhone">Personal Phone: {{ contactByUUID.contact.PersonalPhone }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.PersonalMobile">Personal Mobile: {{ contactByUUID.contact.PersonalMobile }}</q-input>

      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact">Business info</q-input>

      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.BusinessEmail">Business E-mail: {{ contactByUUID.contact.BusinessEmail }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.BusinessCompany">Company: {{ contactByUUID.contact.BusinessCompany }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.BusinessDepartment">Department: {{ contactByUUID.contact.BusinessDepartment }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.BusinessJobTitle">Job Title: {{ contactByUUID.contact.BusinessJobTitle }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.BusinessOffice">Office: {{ contactByUUID.contact.BusinessOffice }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.BusinessAddress">Street Address: {{ contactByUUID.contact.BusinessAddress }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.BusinessCity">City: {{ contactByUUID.contact.BusinessCity }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.BusinessState">State/Province: {{ contactByUUID.contact.BusinessState }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.BusinessZip">Zip Code: {{ contactByUUID.contact.BusinessZip }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.BusinessCountry">Country/Region: {{ contactByUUID.contact.BusinessCountry }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.BusinessWeb">Web Page: {{ contactByUUID.contact.BusinessWeb }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.BusinessFax">Business Fax: {{ contactByUUID.contact.BusinessFax }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.BusinessPhone">Business Phone: {{ contactByUUID.contact.BusinessPhone }}</q-input>

      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact">Other info</q-input>

      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.BirthDay">Birthday: {{ contactByUUID.contact.BirthDay }} {{ contactByUUID.contact.BirthMonth }} {{ contactByUUID.contact.BirthYear }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.OtherEmail">Other E-mail: {{ contactByUUID.contact.OtherEmail }}</q-input>
      <q-input outlined v-model="searchText" :dense=true value="" v-if="contactByUUID.contact.Notes">Notes: {{ contactByUUID.contact.Notes }}</q-input>
    </q-item-section>
  </div>
</template>

<style></style>

<script>
//import {contacts, contactsOffline} from "../../contactsData.js"
import webApi from "src/utils/webApi.js";

export default {
  name: "ContactEdit",
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
