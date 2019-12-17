<template>
  <q-chip :clickable="!!contact">
    {{ fullAddr }}
    <q-icon name="add" v-if="!contact" @click="openCreateContactPopup(fullAddr)" style="font-size: 1.5em; margin-left: 10px;" />
    <q-popup-proxy>
      <q-card flat bordered class="my-card bg-grey-1" v-if="contact">
        <q-card-section>
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-h6">{{ contact.FullName }}</div>
              <div class="text-subtitle1">{{ contact.ViewEmail }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section>
        <q-item-section class="column full-height">
          <q-item-label v-if="contact.FirstName"> First name: {{ contact.FirstName }}</q-item-label>
          <q-item-label v-if="contact.LastName">Last name: {{ contact.LastName }}</q-item-label>
          <q-item-label v-if="contact.Skype">Skype: {{ contact.Skype }}</q-item-label>
          <q-item-label v-if="contact.Facebook">Facebook: {{ contact.Facebook }}</q-item-label>
          <q-item-label v-if="contact.PersonalEmail || 
            contact.PersonalAddress || contact.PersonalCity || contact.PersonalState ||contact.PersonalCountry ||
            contact.PersonalZip || contact.PersonalWeb || contact.PersonalFax || contact.PersonalPhone ||
            contact.PersonalMobile">Basic info</q-item-label>

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

          <q-item-label v-if="contact.BusinessEmail || 
            contact.BusinessCompany || contact.BusinessDepartment || contact.BusinessJobTitle || contact.BusinessOffice || 
            contact.BusinessAddress || contact.BusinessCity || contact.BusinessState || contact.BusinessZip || contact.BusinessCountry || 
            contact.BusinessWeb || contact.BusinessFax || contact.BusinessPhone">Business info</q-item-label>

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

          <q-item-label v-if="contact.BirthYear && contact.BirthMonth && contact.BirthDay || 
            contact.OtherEmail || contact.Notes">Other info</q-item-label>

          <q-item-label v-if="contact.BirthDay">Birthday: {{sBirthDate}}</q-item-label>
          <q-item-label v-if="contact.OtherEmail">Other E-mail: {{ contact.OtherEmail }}</q-item-label>
          <q-item-label v-if="contact.Notes">Notes: {{ contact.Notes }}</q-item-label>
        </q-item-section>
        </q-card-section>

        <q-separator />

        <q-card-actions>
          <q-btn @click="sendContact" flat>Send this contact</q-btn>
          <q-btn @click="emailToContact" flat>Email to this contact</q-btn>
        </q-card-actions>
      </q-card>
    </q-popup-proxy>
    <q-dialog v-model="bNewContactDialog" persistent>
      <q-card>
        <q-card-section class="row items-center q-pa-md">
          <q-list style="width: 500px;">
            <q-item>
              <q-item-label header>New Contact</q-item-label>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Display name:</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-input type="text" v-model="sNewContactDisplayName" outlined dense class="input-size" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Email:</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-input type="text" v-model="sNewContactEmail" outlined dense class="input-size" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Phone:</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-input type="text" v-model="sNewContactPhone" outlined dense class="input-size" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Address:</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-input type="text" v-model="sNewContactAddress" outlined dense class="input-size" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Skype:</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-input type="text" v-model="sNewContactSkype" outlined dense class="input-size" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Facebook:</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-input type="text" v-model="sNewContactFacebook" outlined dense class="input-size" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section align="right">
          <a href="javascript:void(0)" @click="showAdditionalFields">Show additional fields</a>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Saving..." color="primary" v-if="bSaving" />
          <q-btn flat label="Save" color="primary" v-if="!bSaving" @click="saveNewContact" />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-chip>
</template>

<style scoped>
.input-size {
  width: 300px;
}
</style>

<script>
import { ipcRenderer } from 'electron'
import moment from 'moment'

import addressUtils from 'src/utils/address.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types'

import contactsEnums from 'src/modules/contacts/enums.js'
import CContact from 'src/modules/contacts/classes/CContact.js'

export default {
  name: 'ContactFields',

  props: ['contact', 'fullAddr'],

  data() {
    return {
      sBirthDate: '',

      bNewContactDialog: false,
      sNewContactDisplayName: '',
      sNewContactEmail: '',
      sNewContactPhone: '',
      sNewContactAddress: '',
      sNewContactSkype: '',
      sNewContactFacebook: '',
      bSaving: false,
    }
  },

  mounted: function() {
    this.setBirthDate()
    this.initSubscriptions()
  },

  beforeDestroy: function () {
    this.destroySubscriptions()
  },

  methods: {
    setBirthDate () {
      if (this.contact && this.contact.BirthYear && this.contact.BirthMonth && this.contact.BirthDay) {
        let sDate = `${this.contact.BirthYear}-${this.contact.BirthMonth}-${this.contact.BirthDay}`
        this.sBirthDate = `${moment(sDate).format('ll')} ( ${moment(sDate).fromNow(true)} )`
      }
    },
    emailToContact () {
      let sToAddr = this.contact.getFull()
      this.openCompose({ sToAddr })
    },
    sendContact () {
      this.dummyAction()
    },
    dummyAction () {
      notification.showReport('There is no action here yet')
    },
    openCreateContactPopup (sFullAddr) {
      let oEmailParts = addressUtils.getEmailParts(sFullAddr)
      this.bSaving = false
      this.sNewContactDisplayName = oEmailParts.name
      this.sNewContactEmail = oEmailParts.email
      this.bNewContactDialog = true
    },
    showAdditionalFields () {
      this.dummyAction()
    },
    saveNewContact () {
      let oContactToSave = new CContact({
        FullName: this.sNewContactDisplayName,
        BusinessEmail: this.sNewContactEmail,
        PrimaryEmail: contactsEnums.PrimaryEmail.Business,
        BusinessPhone: this.sNewContactPhone,
        PrimaryPhone: contactsEnums.PrimaryPhone.Business,
        BusinessAddress: this.sNewContactAddress,
        PrimaryAddress: contactsEnums.PrimaryAddress.Business,
        Skype: this.sNewContactSkype,
        Facebook: this.sNewContactFacebook,
      })
      oContactToSave.setViewEmail()
      this.bSaving = true
      ipcRenderer.send('contacts-save-contact', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        oContactToSave,
      })
    },
    onSaveContact (oEvent, { oContactWithUpdatedETag, oError }) {
      this.bSaving = false
      if (oContactWithUpdatedETag) {
        notification.showReport('The contact has been created.')
        this.$store.commit('contacts/setHasChanges', true)
        this.bNewContactDialog = false
      } else {
        notification.showError(errors.getText(oError, 'Error creating contact.'))
      }
    },
    initSubscriptions () {
      ipcRenderer.on('contacts-save-contact', this.onSaveContact)
    },
    destroySubscriptions () {
      ipcRenderer.removeListener('contacts-save-contact', this.onSaveContact)
    },
  },
}
</script>
