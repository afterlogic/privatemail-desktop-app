<template>
  <div>
    <div v-if="contact">
      <q-item-section >
        <div class="head">
          <div class="head--labels">
            <q-item-label class="head--labels-name">{{ contact.FullName }}</q-item-label>  
            <q-item-label class="head--labels-email" caption lines="1">{{ contact.ViewEmail }}</q-item-label>
          </div>
          <div class="head--buttons-container">        
            <q-btn class="head--buttons-style" color="primary" label="">Send this contact</q-btn>
            <q-btn class="head--buttons-style" color="primary" label="Email to this contact" />
          </div>
        </div>
        
        <div class="content-area">
          <q-btn class="btn-edit" color="primary" label="Edit contact" @click="enableEditContact"/>
          <q-scroll-area style="height: 800px; max-width: 100%;" :thumb-style="{left: '102%', borderRadius: '5px', background: '#BBBBBB', width: '7px', opacity: 1 }" >
            

            <q-item-label class="info-line" v-if="contact.FirstName">  First name: {{ contact.FirstName }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.LastName">Last name: {{ contact.LastName }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.Skype">Skype: {{ contact.Skype }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.Facebook">Facebook: {{ contact.Facebook }}</q-item-label>
            

            <q-item-label style="margin: 30px 0px 30px 25px; font-size: 10.5pt; color: #3d3d3d; font-weight: 600;" v-if="contact.PersonalEmail || 
              contact.PersonalAddress || contact.PersonalCity || contact.PersonalState ||contact.PersonalCountry ||
              contact.PersonalZip || contact.PersonalWeb || contact.PersonalFax || contact.PersonalPhone ||
              contact.PersonalMobile">Basic info</q-item-label>

            <q-item-label class="info-line" v-if="contact.PersonalEmail">Personal E-mail: {{ contact.PersonalEmail }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.PersonalAddress">Personal Address: {{ contact.PersonalAddress }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.PersonalCity">Personal City: {{ contact.PersonalCity }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.PersonalState">Personal State: {{ contact.PersonalState }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.PersonalCountry">Personal Country: {{ contact.PersonalCountry }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.PersonalZip">Personal Zip: {{ contact.PersonalZip }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.PersonalWeb">Personal Web: {{ contact.PersonalWeb }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.PersonalFax">Personal Fax: {{ contact.PersonalFax }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.PersonalPhone">Personal Phone: {{ contact.PersonalPhone }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.PersonalMobile">Personal Mobile: {{ contact.PersonalMobile }}</q-item-label>

            <q-item-label style="margin: 30px 0px 30px 25px; font-size: 10.5pt; color: #3d3d3d; font-weight: 600;" v-if="contact.BusinessEmail || 
              contact.BusinessCompany || contact.BusinessDepartment || contact.BusinessJobTitle || contact.BusinessOffice || 
              contact.BusinessAddress || contact.BusinessCity || contact.BusinessState || contact.BusinessZip || contact.BusinessCountry || 
              contact.BusinessWeb || contact.BusinessFax || contact.BusinessPhone">Business info</q-item-label>

            <q-item-label class="info-line" v-if="contact.BusinessEmail">Business E-mail: {{ contact.BusinessEmail }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.BusinessCompany">Company: {{ contact.BusinessCompany }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.BusinessDepartment">Department: {{ contact.BusinessDepartment }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.BusinessJobTitle">Job Title: {{ contact.BusinessJobTitle }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.BusinessOffice">Office: {{ contact.BusinessOffice }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.BusinessAddress">Street Address: {{ contact.BusinessAddress }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.BusinessCity">City: {{ contact.BusinessCity }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.BusinessState">State/Province: {{ contact.BusinessState }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.BusinessZip">Zip Code: {{ contact.BusinessZip }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.BusinessCountry">Country/Region: {{ contact.BusinessCountry }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.BusinessWeb">Web Page: {{ contact.BusinessWeb }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.BusinessFax">Business Fax: {{ contact.BusinessFax }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.BusinessPhone">Business Phone: {{ contact.BusinessPhone }}</q-item-label>

            <q-item-label style="margin: 30px 0px 30px 25px; font-size: 10.5pt; color: #3d3d3d; font-weight: 600;" v-if="contact.BirthYear && contact.BirthMonth && contact.BirthDay || 
              contact.OtherEmail || contact.Notes">Other info</q-item-label>

            <q-item-label class="info-line" v-if="contact.BirthDay">Birthday: {{sBirthDate}}</q-item-label>
            <q-item-label class="info-line" v-if="contact.OtherEmail">Other E-mail: {{ contact.OtherEmail }}</q-item-label>
            <q-item-label class="info-line" v-if="contact.Notes">Notes: {{ contact.Notes }}</q-item-label>
          </q-scroll-area>
        </div>
      </q-item-section>
    </div>
  </div>
</template>

<style>
.head {
  display: flex;
  justify-content: space-between;
}

.head--labels-name {
  font-size: 18pt;
  font-weight: normal;
  white-space: normal;
  color: #555566;
}

.head--labels-email {
  color: #BC4799;
  font-size: 10.5pt;
  font-weight: bold;
  text-decoration: none
}

.head--buttons-container {
  display: flex;
  justify-content: flex-end;
  width: 70%;
}

.head--buttons-style {
  width: 30%;
  min-width: 85px;
  height: 34px;
  margin: 0px 3px;
  text-align: right;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  font: bold 10pt Helvetica, Tahoma, Arial, sans-serif;
  padding: 2px 2px;
  text-align: center;
  background: #BC4799;
  border: 1px solid #98387b;
  color: #ffffff;
  text-shadow: 0px 1px 0px rgba(0, 0, 0, 0.3);
  text-transform: none;
}

.content-area {
  width: 100%;
  border-radius: 4px 4px 2px 2px;
  border: 1px solid #d4cece;
  /* box-shadow: 0 1px 0px 0 grey;  */
  margin-top: 20px;
}

.btn-edit {
  margin: 20px 40px 0px 0px;
  position: absolute;
  right: 0px;
  z-index: 1;
  text-transform: none;
  padding: 0px 9px;
  width: 20%;
  min-width: 94px;
}

.info-main {
  display: flex;
}

.info-line {
  margin: 10px 0px 20px 25px;
  font-size: 9pt;
}
</style>

<script>
import webApi from 'src/utils/webApi.js'
import CContact from 'src/modules/contacts/classes/CContact.js'
import moment from 'moment'

export default {
  name: 'ContactFields',
  data() {
    return {
      checkboxVal: false,
      sBirthDate: '',
    }
  },

  mounted: function() { 
    console.log('null year', this.contact)
    if (this.contact && this.contact.BirthYear && this.contact.BirthMonth && this.contact.BirthDay)    {
      let sDate = `${this.contact.BirthYear}-${this.contact.BirthMonth}-${this.contact.BirthDay}`
      this.sBirthDate = `${moment(sDate).format('ll')} ( ${moment(sDate).fromNow(true)} )`

    }
    
  },
  watch: {

  },
  computed: {
    // contactByUUID() {
      //   return this.$store.getters['contacts/getContactByUUID']
    // },
    'contact': function() {
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
