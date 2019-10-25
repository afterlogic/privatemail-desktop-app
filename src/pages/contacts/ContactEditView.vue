<template>
  <div>
    <div v-if="oContact">
      <h2> Edit Contact</h2>
      <div v-if="bSmallEditView">
        <div class="inputLine"><label>Display name:</label><q-input class="" outlined v-model="oContact.FullName" :dense=true ></q-input></div>

        <div class="inputLine" v-if="oContact.PrimaryEmail === 0"><label>Email:</label><q-input outlined v-model="oContact.PersonalEmail" :dense=true></q-input></div>
        <div class="inputLine" v-if="oContact.PrimaryEmail === 1"><label>Email:</label><q-input outlined v-model="oContact.BusinessEmail" :dense=true></q-input></div>
        <div class="inputLine" v-if="oContact.PrimaryEmail === 2"><label>Email:</label><q-input outlined v-model="oContact.OtherEmail" :dense=true></q-input></div>

        <div class="inputLine" v-if="oContact.PrimaryPhone === 0"><label>Phone:</label><q-input outlined v-model="oContact.PersonalMobile" :dense=true></q-input></div>
        <div class="inputLine" v-if="oContact.PrimaryPhone === 1"><label>Phone:</label><q-input outlined v-model="oContact.PersonalPhone" :dense=true></q-input></div>
        <div class="inputLine" v-if="oContact.PrimaryPhone === 2"><label>Phone:</label><q-input outlined v-model="oContact.BusinessPhone" :dense=true></q-input></div>

        <div class="inputLine" v-if="oContact.PrimaryAddress === 0"><label>Address:</label><q-input outlined v-model="oContact.PersonalAddress" :dense=true></q-input></div>
        <div class="inputLine" v-if="oContact.PrimaryAddress === 1"><label>Address:</label><q-input outlined v-model="oContact.BusinessAddress" :dense=true></q-input></div>
        
        <div class="inputLine"><label>Skype:</label><q-input outlined v-model="oContact.Skype" :dense=true></q-input></div>
        <div class="inputLine"><label>Facebook:</label><q-input outlined v-model="oContact.Facebook" :dense=true></q-input></div>
        <a class="link" @click="changeSmallEditView">Show additional fields</a>
      </div>
      <div class="editField" v-else>
      <q-scroll-area style="height: 640px; max-width: 100%;" :thumb-style="{left: '103%', borderRadius: '5px', background: '#474c50', width: '10px', opacity: 1 }" >
      
        <q-item-section>
          <div class="inputLine"><label>Display name:</label><q-input class="" outlined v-model="oContact.FullName" :dense=true></q-input></div>
          <div class="inputLine" >
            <label>Email:</label>
            <q-select outlined v-model="oPrimaryEmail" :options="aPrimaryMailOptions" dense />            
          </div>
          <div class="inputLine">
            <label>Phone:</label>
            <q-select outlined v-model="oPrimaryPhone" :options="aPrimaryPhoneOptions" dense />            
          </div>
          <div class="inputLine">
            <label>Address:</label>
            <q-select outlined v-model="oPrimaryAddress" :options="aPrimaryAddressOptions" dense />            
          </div>
          <div class="inputLine"><label>Skype:</label><q-input outlined v-model="oContact.Skype" :dense=true></q-input></div>
          <div class="inputLine"><label>Facebook:</label><q-input outlined v-model="oContact.Facebook" :dense=true></q-input></div>
          <a class="link" @click="changeSmallEditView">Hide additional fields</a>
          
          <div class="inputLine"><label>First name:</label><q-input class="" outlined v-model="oContact.FirstName" :dense=true ></q-input></div>
          
          <div class="inputLine"><label>Last name:</label><q-input outlined v-model="oContact.LastName" :dense=true></q-input></div>
          <div class="inputLine"><label>Skype:</label><q-input outlined v-model="oContact.Skype" :dense=true></q-input></div>
          <div class="inputLine"><label>Facebook:</label><q-input outlined v-model="oContact.Facebook" :dense=true></q-input></div>

          Basic info

          <div class="inputLine"><label>Personal E-mail:</label><q-input outlined v-model="oContact.PersonalEmail" :dense=true> </q-input></div>
          <div class="inputLine"><label>Personal Address:</label><q-input outlined v-model="oContact.PersonalAddress" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal City:</label><q-input outlined v-model="oContact.PersonalCity" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal State:</label><q-input outlined v-model="oContact.PersonalState" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal Country:</label><q-input outlined v-model="oContact.PersonalCountry" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal Zip:</label><q-input outlined v-model="oContact.PersonalZip" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal Web:</label><q-input outlined v-model="oContact.PersonalWeb" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal Fax:</label><q-input outlined v-model="oContact.PersonalFax" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal Phone:</label><q-input outlined v-model="oContact.PersonalPhone" :dense=true></q-input></div>
          <div class="inputLine"><label>Personal Mobile:</label><q-input outlined v-model="oContact.PersonalMobile" :dense=true></q-input></div>

          Business info

          <div class="inputLine"><label>Business E-mail:</label><q-input outlined v-model="oContact.BusinessEmail" :dense=true></q-input></div>
          <div class="inputLine"><label>Company:</label><q-input outlined v-model="oContact.BusinessCompany" :dense=true></q-input></div>
          <div class="inputLine"><label>Department:</label><q-input outlined v-model="oContact.BusinessDepartment" :dense=true></q-input></div>
          <div class="inputLine"><label>Job Title:</label><q-input outlined v-model="oContact.BusinessJobTitle" :dense=true></q-input></div>
          <div class="inputLine"><label>Office:</label><q-input outlined v-model="oContact.BusinessOffice" :dense=true></q-input></div>
          <div class="inputLine"><label>Street Address:</label><q-input outlined v-model="oContact.BusinessAddress" :dense=true></q-input></div>
          <div class="inputLine"><label>City:</label><q-input outlined v-model="oContact.BusinessCity" :dense=true></q-input></div>
          <div class="inputLine"><label>State/Province:</label><q-input outlined v-model="oContact.BusinessState" :dense=true></q-input></div>
          <div class="inputLine"><label>Zip Code:</label><q-input outlined v-model="oContact.BusinessZip" :dense=true></q-input></div>
          <div class="inputLine"><label>Country/Region:</label><q-input outlined v-model="oContact.BusinessCountry" :dense=true></q-input></div>
          <div class="inputLine"><label>Web Page:</label><q-input outlined v-model="oContact.BusinessWeb" :dense=true></q-input></div>
          <div class="inputLine"><label>Business Fax:</label><q-input outlined v-model="oContact.BusinessFax" :dense=true></q-input></div>
          <div class="inputLine"><label>Business Phone:</label><q-input outlined v-model="oContact.BusinessPhone" :dense=true></q-input></div>

          <span>Other info</span>

          <div class="inputLine">
            <label>Birthday:</label>
            <div class="q-pa-md" style="max-width: 300px">
              <q-input filled v-model="date" mask="date" :rules="['date']" @change="console">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                      <q-date v-model="date" @input="() => $refs.qDateProxy.hide()" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>            
          </div>
          
          <div class="inputLine"><label>Other E-mail:</label><q-input outlined v-model="oContact.OtherEmail" :dense=true></q-input></div>
          <div class="inputLine"><label>Notes:</label><q-input outlined v-model="oContact.Notes" :dense=true></q-input></div>
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
      oContact: null,
      bSmallEditView: true,
      oPrimaryEmail: null,
      oPrimaryPhone: null,
      oPrimaryAddress: null,
      date: '',
    }
  },

  mounted: function() {
    let ContactByUUID = this.$store.getters['contacts/getContactByUUID']
    let oContact = _.cloneDeep(ContactByUUID.contact)
    this.oContact = (oContact && oContact instanceof CContact) ? oContact : null

    this.oPrimaryEmail = _.find(this.aPrimaryMailOptions, {'value': oContact.PrimaryEmail})
    this.oPrimaryPhone = _.find(this.aPrimaryPhoneOptions, {'value': oContact.PrimaryPhone})
    this.oPrimaryAddress = _.find(this.aPrimaryAddressOptions, {'value': oContact.PrimaryAddress})

    this.oContact.BirthYear = this.oContact.BirthYear ? this.oContact.BirthYear : '0000'

    this.oContact.BirthMonth = this.oContact.BirthMonth ? this.oContact.BirthMonth : '00'
    this.oContact.BirthMonth = this.oContact.BirthMonth.length > 1 ? this.oContact.BirthMonth : '0' + this.oContact.BirthMonth

    this.oContact.BirthDay = this.oContact.BirthDay ? this.oContact.BirthDay : '00'
    this.oContact.BirthDay = this.oContact.BirthDay > 1 ? this.oContact.BirthDay : '0' + this.oContact.BirthDay
    this.date = this.oContact.BirthYear + '/' + this.oContact.BirthMonth + '/' + this.oContact.BirthDay
    console.log(this.date)
  },
  beforeDestroy: function () {
    this.disableEditContact()
  },
  watch: {
    'oPrimaryEmail': function (v) {
      if (v) {
        this.oContact.PrimaryEmail = v.value
      }
    },
    'oPrimaryPhone': function (v) {
      if (v) {
        this.oContact.PrimaryPhone = v.value
      }
    },
    'oPrimaryAddress': function (v) {
      if (v) {
        this.oContact.PrimaryAddress = v.value
      }
    },
  },
  computed: {
    'aPrimaryMailOptions': function () {
      let aOptions = []
      if (this.oContact !== null) {
        if (this.oContact.PersonalEmail !== '') {
          aOptions.push({ label: '' + this.oContact.PersonalEmail, value: 0 })
        }
        if (this.oContact.BusinessEmail !== '') {
          aOptions.push({ label: '' + this.oContact.BusinessEmail, value: 1 })
        }
        if (this.oContact.OtherEmail !== '') {
          aOptions.push({ label: '' + this.oContact.OtherEmail, value: 2 })
        }
      }     

      return aOptions
    },
    'aPrimaryPhoneOptions': function () {
      let aOptions = []
      if (this.oContact !== null) {
        if (this.oContact.PersonalMobile !== '') {
          aOptions.push({ label: '' + this.oContact.PersonalMobile, value: 0 })
        }
        if (this.oContact.PersonalPhone !== '') {
          aOptions.push({ label: '' + this.oContact.PersonalPhone, value: 1 })
        }
        if (this.oContact.BusinessPhone !== '') {
          aOptions.push({ label: '' + this.oContact.BusinessPhone, value: 2 })
        }
      }
      
      return aOptions
    },
    'aPrimaryAddressOptions': function () {
      let aOptions = []
      if (this.oContact !== null) {
        if (this.oContact.PersonalAddress !== '') {
          aOptions.push({ label: '' + this.oContact.PersonalAddress, value: 0 })
        }
        if (this.oContact.BusinessAddress !== '') {
          aOptions.push({ label: '' + this.oContact.BusinessAddress, value: 1 })
        }
      }

      return aOptions
    }
  },

  methods: {
    onSave () {
        let ContactByUUID = this.$store.getters['contacts/getContactByUUID']
        let oContactSource = ContactByUUID.contact
        let oSavedContact = null
        let bEqual = _.isEqual(this.oContact, oContactSource)
       
        if (!bEqual) {
          oSavedContact = _.cloneDeep(this.oContact)
        }

        this.disableEditContact()
    },

    disableEditContact() {
      this.$store.dispatch('contacts/disableEditContact')
    },

    changeSmallEditView() {
      this.bSmallEditView = !this.bSmallEditView
    },
    console () {
      console.log(this.date)
    }
  },
}
</script>
