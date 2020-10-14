<template>
  <q-chip unelevated :class="{'found_contact': !!contact, 'no_contact': !contact}">
    <!-- TODO add @mouseover="openCardPopup(true)" @mouseout="openCardPopup(false)" to the root element to make the card visible by hovering -->
    <span v-if="!min">{{ addr.full }}</span>
    <span v-if="min">{{ (currentAccountEmail === addr.email) ? 'me' : (addr.name || addr.email) }}</span>
    <q-btn size="8px" unelevated dense rounded color="primary" v-if="!contact" @click="openCreateContactPopup" style="margin-left: 10px; margin-right: -8px;" >
      <q-icon size="12px" color="white" name="add" />
    </q-btn>
    <!-- the hover ement should be on card itself also @mouseover="openCardPopup(true)" @mouseout="openCardPopup(false)" -->
    <q-popup-proxy ref="cardPopup">
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
          <q-btn flat @click="emailToContact">Send mail</q-btn>
          <q-btn flat @click="viewAllMailsWithContact">View all mails with this contact</q-btn>
        </q-card-actions>
      </q-card>
    </q-popup-proxy>
    
    <q-dialog v-model="bNewContactDialog" persistent>
      <q-card class="non-selectable">
        <q-card-section>
          <div class="text-h6">New Contact</div>
        </q-card-section>
        <q-list>
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
        <q-card-section align="right">
          <a href="javascript:void(0)" @click="showAdditionalFields">Show additional fields</a>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Creating..." color="primary" v-if="bSaving" />
          <q-btn flat label="Create" color="primary" v-if="!bSaving" @click="saveNewContact" />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-chip>
</template>

<style lang="scss" scoped>
.input-size {
  width: 300px;
}
.q-chip.found_contact {
  min-width: 2em;
  justify-content: center;
  color: var(--q-color-primary);
  background: var(--q-color-primary-pale);
  // background: lighten(var(--q-color-primary), 0.5);
  
}
.q-chip.no_contact {
  min-width: 2em;
  justify-content: center;
  background: #fff;
  color: var(--q-color-primary);
  border: solid 1px var(--q-color-primary);
}

</style>

<script>
import { ipcRenderer } from 'electron'
import moment from 'moment'
import _ from 'lodash'

import addressUtils from 'src/utils/address.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types'

import contactsEnums from 'src/modules/contacts/enums.js'
import CContact from 'src/modules/contacts/classes/CContact.js'

export default {
  name: 'ContactCard',

  props: ['addr', 'min'],

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
      bShowContactCard: false,
    }
  },

  computed: {
    contact: function () {
      let oContacts = this.$store.getters['contacts/getContactsByEmail']
      let oContact = oContacts[this.addr.email]
      return oContact
    },
    currentAccountEmail: function () {
      return this.$store.getters['mail/getCurrentAccountEmail']
    },
  },

  mounted: function() {
    this.setBirthDate()
  },

  beforeDestroy: function () {
    ipcRenderer.removeListener('contacts-save-contact', this.onSaveContact)
  },

  watch: {
    'bShowContactCard': function (v) {
      if (this.$refs.cardPopup) {
        if (v) {
          this.$refs.cardPopup.show()
        } else {
          this.$refs.cardPopup.hide()
        }
      }
    }
  },

  methods: {
    openCardPopup: _.debounce(function (bShow) {
      this.bShowContactCard = bShow;
    }, 300),
    setBirthDate () {
      if (this.contact && this.contact.BirthYear && this.contact.BirthMonth && this.contact.BirthDay) {
        let sDate = `${this.contact.BirthYear}-${this.contact.BirthMonth}-${this.contact.BirthDay}`
        this.sBirthDate = `${moment(sDate).format('ll')} ( ${moment(sDate).fromNow(true)} )`
      }
    },
    emailToContact () {
      let aToContacts = [{
        full: this.contact.getFull(),
        email: this.contact.ViewEmail,
        name: this.contact.FullName,
        id: this.contact.EntityId,
        hasPgpKey: !!this.contact.PublicPgpKey,
        pgpEncrypt: this.contact.PgpEncryptMessages,
        pgpSign: this.contact.PgpSignMessages,
      }]
      this.openCompose({ aToContacts })
      if (this.$refs.cardPopup) {
        this.$refs.cardPopup.hide()
      }
    },
    viewAllMailsWithContact () {
      this.$store.dispatch('mail/asyncGetMessages', {
        iPage: 1,
        sSearch: 'email:' + this.contact.ViewEmail,
        sFilter: '',
      })
      if (this.$refs.cardPopup) {
        this.$refs.cardPopup.hide()
      }
    },
    sendThisContact () {
      let aFull = _.compact([this.contact.FullName, this.contact.ViewEmail])
      let sFileName = 'contact-' + aFull.join(' ') + '.vcf'
      this.openCompose({
        aAttachments:
        [
          {
            FileName: sFileName,
            ContactUUID: this.contact.UUID,
          }
        ],
      })
      if (this.$refs.cardPopup) {
        this.$refs.cardPopup.hide()
      }
    },
    openCreateContactPopup () {
      let oEmailParts = addressUtils.getEmailParts(this.addr.full)
      this.bSaving = false
      this.sNewContactDisplayName = oEmailParts.name
      this.sNewContactEmail = oEmailParts.email
      this.bNewContactDialog = true
    },
    showAdditionalFields () {
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
      this.$router.push({ path: '/contacts' })
      this.$store.commit('contacts/setNewContactToEdit', oContactToSave)
      this.$store.commit('contacts/changeStateForCreatingContact', true)
    },
    saveNewContact () {
      let bAllFieldsEmpty = _.trim(this.sNewContactDisplayName) === ''
                          && _.trim(this.sNewContactEmail) === ''
                          && _.trim(this.sNewContactPhone) === ''
                          && _.trim(this.sNewContactAddress) === ''
                          && _.trim(this.sNewContactSkype) === ''
                          && _.trim(this.sNewContactFacebook) === ''
      if (bAllFieldsEmpty) {
        notification.showError('Please fill in at least one field')
      } else {
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
        ipcRenderer.on('contacts-save-contact', this.onSaveContact)
        ipcRenderer.send('contacts-save-contact', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          oContactToSave,
        })
      }
    },
    onSaveContact (oEvent, { oContactWithUpdatedETag, oError }) {
      ipcRenderer.removeListener('contacts-save-contact', this.onSaveContact)
      this.bSaving = false
      if (oContactWithUpdatedETag) {
        notification.showReport('The contact has been created.')
        this.$store.commit('contacts/addContactByEmail', { sEmail: oContactWithUpdatedETag.ViewEmail, mContact: undefined })
        this.$store.dispatch('contacts/asyncGetContactsByEmails', [oContactWithUpdatedETag.ViewEmail])
        this.bNewContactDialog = false
      } else {
        notification.showError(errors.getText(oError, 'Error creating contact.'))
      }
    },
  },
}
</script>
