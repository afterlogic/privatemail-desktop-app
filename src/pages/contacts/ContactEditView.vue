<template>
  <div>
    <div v-if="contact">
      <h2> Edit Contact</h2>
      <div v-if="smallEditView">
        <div class="inputLine"><label>Display name:</label><q-input class="inputWidth" outlined v-model="contact.FullName" :dense=true @keypress="console"></q-input></div>
        <div class="inputLine"><label>Email:</label><q-input outlined v-model="contact.PersonalEmail" :dense=true></q-input></div>
        <div class="inputLine"><label>Phone:</label><q-input outlined v-model="contact.PersonalPhone" :dense=true></q-input></div>
        <div class="inputLine"><label>Address:</label><q-input outlined v-model="contact.PersonalAddress" :dense=true></q-input></div>
        <div class="inputLine"><label>Skype:</label><q-input outlined v-model="contact.Skype" :dense=true></q-input></div>
        <div class="inputLine"><label>Facebook:</label><q-input outlined v-model="contact.Facebook" :dense=true></q-input></div>
        <a class="link" @click="changeSmallEditView">Show additional fields</a>
      </div>
      <div class="editField" v-else>
      <q-scroll-area style="height: 640px; max-width: 100%;" :thumb-style="{left: '103%', borderRadius: '5px', background: '#474c50', width: '10px', opacity: 1 }" >
      
        <q-item-section >
          <div class="inputLine"><label>Display name:</label><q-input class="inputWidth" outlined v-model="contact.FullName" :dense=true @keypress="console"></q-input></div>
          <select v-model="selected">
            <option value="">{{contact.PersonalEmail}}</option>
            <option value="">{{contact.BusinessEmail}}</option>
            <option value="">{{contact.OtherEmail}}</option>
          </select>
          <div class="inputLine"><label>Email:</label><q-input outlined v-model="contact.PersonalEmail" :dense=true></q-input></div>
          <div class="inputLine"><label>Phone:</label><q-input outlined v-model="contact.PersonalPhone" :dense=true></q-input></div>
          <div class="inputLine"><label>Address:</label><q-input outlined v-model="contact.PersonalAddress" :dense=true></q-input></div>
          <div class="inputLine"><label>Skype:</label><q-input outlined v-model="contact.Skype" :dense=true></q-input></div>
          <div class="inputLine"><label>Facebook:</label><q-input outlined v-model="contact.Facebook" :dense=true></q-input></div>
          <a class="link" @click="changeSmallEditView">Show additional fields</a>
          
          <div class="inputLine"><label>First name:</label><q-input class="inputWidth" outlined v-model="contact.FirstName" :dense=true @keypress="console"></q-input></div>
          
          <div class="inputLine"><label>Last name:</label><q-input outlined v-model="contact.LastName" :dense=true></q-input></div>
          <div class="inputLine"><label>Skype:</label><q-input outlined v-model="contact.Skype" :dense=true></q-input></div>
          <div class="inputLine"><label>Facebook:</label><q-input outlined v-model="contact.Facebook" :dense=true></q-input></div>

          Basic info

          <div class="inputLine"><label>Personal E-mail:</label><q-input outlined v-model="contact.PersonalEmail" :dense=true> </q-input></div>
          <div class="inputLine"><label>Personal Address:</label><q-input outlined v-model="contact.PersonalAddress" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal City:</label><q-input outlined v-model="contact.PersonalCity" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal State:</label><q-input outlined v-model="contact.PersonalState" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal Country:</label><q-input outlined v-model="contact.PersonalCountry" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal Zip:</label><q-input outlined v-model="contact.PersonalZip" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal Web:</label><q-input outlined v-model="contact.PersonalWeb" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal Fax:</label><q-input outlined v-model="contact.PersonalFax" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal Phone:</label><q-input outlined v-model="contact.PersonalPhone" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal Mobile:</label><q-input outlined v-model="contact.PersonalMobile" :dense=true></q-input></div>

          Business info

          <div class="inputLine"><label>Business E-mail:</label><q-input outlined v-model="contact.BusinessEmail" :dense=true></q-input></div>
          <div class="inputLine"><label>Company:</label><q-input outlined v-model="contact.BusinessCompany" :dense=true></q-input></div>
          <div class="inputLine"><label>Department:</label><q-input outlined v-model="contact.BusinessDepartment" :dense=true></q-input></div>
          <div class="inputLine"><label>Job Title:</label><q-input outlined v-model="contact.BusinessJobTitle" :dense=true></q-input></div>
          <div class="inputLine"><label>Office:</label><q-input outlined v-model="contact.BusinessOffice" :dense=true></q-input></div>
          <div class="inputLine"><label>Street Address:</label><q-input outlined v-model="contact.BusinessAddress" :dense=true></q-input></div>
          <div class="inputLine"><label>City:</label><q-input outlined v-model="contact.BusinessCity" :dense=true></q-input></div>
          <div class="inputLine"><label>State/Province:</label><q-input outlined v-model="contact.BusinessState" :dense=true></q-input></div>
          <div class="inputLine"><label>Zip Code:</label><q-input outlined v-model="contact.BusinessZip" :dense=true></q-input></div>
          <div class="inputLine"><label>Country/Region:</label><q-input outlined v-model="contact.BusinessCountry" :dense=true></q-input></div>
          <div class="inputLine"><label>Web Page:</label><q-input outlined v-model="contact.BusinessWeb" :dense=true></q-input></div>
          <div class="inputLine"><label>Business Fax:</label><q-input outlined v-model="contact.BusinessFax" :dense=true></q-input></div>
          <div class="inputLine"><label>Business Phone:</label><q-input outlined v-model="contact.BusinessPhone" :dense=true></q-input></div>

          Other info

          <div class="inputLine"><label>Birthday:</label><q-input outlined v-model="contact.BirthDay" :dense=true>{{ contact.BirthDay }} {{ contact.BirthMonth }} {{ contact.BirthYear }}</q-input></div>
          <div class="inputLine"><label>Other E-mail:</label><q-input outlined v-model="contact.OtherEmail" :dense=true></q-input></div>
          <div class="inputLine"><label>Notes:</label><q-input outlined v-model="contact.Notes" :dense=true></q-input></div>
        </q-item-section>
      
      </q-scroll-area>
      </div>
      <div class="buttons">
        <q-btn color="primary" style="margin: 10px;" label="Save" @click="onSave"/>
        <q-btn color="grey-6" label="Cancel" class="btn-cancel" @click="disableEditContact"/>
      </div>
    </div>
  </div>
</template>

<style>
.inputWidth {
  width: 70%;
}

.inputLine {
  height: 24px;
  align-items: center;
  padding: 0px 25px 0px 40px;
  margin: 15px 0;
  display: flex;
  justify-content: space-between;
}

.editField {
  width: 92%;
  border-radius: 3px;
  border: 1px solid grey;
  box-shadow: 0 1px 0px 0 grey; 
}

.link, .link:visited{
    color: #BC4799;
    cursor: pointer;
    margin-left: 70%;
    text-decoration-line: none;
    text-decoration-style: initial;
    text-decoration-color: initial;
}

.link:hover {
  text-decoration-line:underline
}

h2 {
    font-size: 18pt;
    font-weight: 300;
    line-height: 3.75rem;
    letter-spacing: -0.00833em;
}

.buttons {
  /* border-top: 1px solid #d9d9d9; */
  margin: 0px 20px;
  padding: 20px 5px;
  text-align: right;
}

.btn-cancel {
  background: #a7afb9;
}
</style>

<script>
import webApi from "src/utils/webApi.js"
import CContact from "src/modules/contacts/classes/CContact.js"
import _ from 'lodash'

export default {
  name: 'ContactEditView',
  data() {
    return {
      checkboxVal: false,
      contact: null,
      smallEditView: true
    }
  },

  mounted: function() {
    let ContactByUUID = this.$store.getters['contacts/getContactByUUID']
    let contact = _.cloneDeep(ContactByUUID.contact)
    this.contact = (contact && contact instanceof CContact) ? contact : null
  },
  beforeDestroy: function () {
    this.disableEditContact()
  },
  watch: {
    
  },
  computed: {
    // contact() {
    //   let ContactByUUID = this.$store.getters['contacts/getContactByUUID']
    //   let contact = _.cloneDeep(ContactByUUID.contact)
    //   console.log('computed');
    //   return (contact && contact instanceof CContact) ? contact : null
    // }
  },

  methods: {
    onSave () {
        let ContactByUUID = this.$store.getters['contacts/getContactByUUID']
        let contactSource = ContactByUUID.contact
        let savedContact = null

        savedContact = _.isEqual(this.contact, contactSource) ? _.cloneDeep(contactSource) : _.cloneDeep(this.contact)

        this.$store.dispatch('contacts/saveChangesCurrentContact', savedContact)
        this.disableEditContact()

        //performe save request 
    },
    disableEditContact() {
      this.$store.dispatch('contacts/disableEditContact')
    },
    console () {
      console.log(this.contact)
    },
    changeSmallEditView() {
      this.smallEditView = !this.smallEditView
    }
  },
}
</script>
