<template>
  <div>
    <div v-if="contact">
      <q-item-section >
        <div class="head">
          <div class="head--labels">
            <q-item-label>{{ contact.FullName }}</q-item-label>  
            <q-item-label caption lines="1">{{ contact.ViewEmail }}</q-item-label>
          </div>
          <div class="head--buttons">        
            <q-btn class="head--buttons-style" color="primary" label="">Save this contact</q-btn>
            <q-btn class="head--buttons-style" color="primary" label="Email to this contact" />
          </div>
        </div>
        <div class="content-area">
          <q-scroll-area style="height: 640px; max-width: 100%;" :thumb-style="{left: '90%', borderRadius: '5px', background: '#474c50', width: '10px', opacity: 1 }" >
            <q-item-label v-if="contact.FirstName">  First name: {{ contact.FirstName }}</q-item-label>
            <q-btn class="btn-edit" color="primary" label="Edit contact" @click="enableEditContact"/>
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
          </q-scroll-area>
        </div>
      </q-item-section>
    </div>
  </div>
</template>

<style>
.head {
  display: flex;
}

.head--buttons {
  display: flex;
  margin-left: 25%; 
  justify-content: space-around;
}
.head--buttons-style {
  width: 44%;
  height: 34px;
  margin: 0px 0px;
  text-align: right;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  font: bold 10pt Helvetica, Tahoma, Arial, sans-serif;
  padding: 5px 12px;
  text-align: center;
  background: #BC4799;
  border: 1px solid #98387b;
  color: #ffffff;
  text-shadow: 0px 1px 0px rgba(0, 0, 0, 0.3);
  text-transform: none;
}

.content-area {
  width: 92%;
  border-radius: 3px;
  border: 1px solid grey;
  box-shadow: 0 1px 0px 0 grey; 
}

.btn-edit {
  position: sticky;
  top: 5%;
  left: 60%;
}
</style>

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
