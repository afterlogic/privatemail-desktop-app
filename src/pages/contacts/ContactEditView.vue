<template>
  <q-item-section class="column full-height">
    <div class="col-auto">
      <div class="head">
        <q-item-label class="head--labels-name">{{editMode ? 'Edit Contact' : 'Create Contact'}}</q-item-label>
      </div>
    </div>
    <div class="frame-top q-mx-md"></div>
    <div class="col">
      <div class="column full-height">
        <div class="col">
          <q-scroll-area v-if="oContact" class="full-height" >
            <div class="frame-without-top q-mx-md">
              <div v-if="bSmallEditView">
                <div class="input-line">
                  <label class="label-size">Display name:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.FullName"/>
                </div>
                <div class="input-line" v-if="oContact.PrimaryEmail === contactsEnums.PrimaryEmail.Personal">
                  <label class="label-size">Email:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalEmail"/>
                </div>
                <div class="input-line" v-if="oContact.PrimaryEmail === contactsEnums.PrimaryEmail.Business">
                  <label class="label-size">Email:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessEmail"/>
                </div>
                <div class="input-line" v-if="oContact.PrimaryEmail === contactsEnums.PrimaryEmail.Other">
                  <label class="label-size">Email:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.OtherEmail"/>
                </div>

                <div class="input-line" v-if="oContact.PrimaryPhone === contactsEnums.PrimaryPhone.Mobile">
                  <label class="label-size">Phone:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalMobile"/>
                </div>
                <div class="input-line" v-if="oContact.PrimaryPhone === contactsEnums.PrimaryPhone.Personal">
                  <label class="label-size">Phone:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalPhone"/>
                </div>
                <div class="input-line" v-if="oContact.PrimaryPhone === contactsEnums.PrimaryPhone.Business">
                  <label class="label-size">Phone:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessPhone"/>
                </div>

                <div class="input-line" v-if="oContact.PrimaryAddress === contactsEnums.PrimaryAddress.Personal">
                  <label class="label-size">Address:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalAddress"/>
                </div>
                <div class="input-line" v-if="oContact.PrimaryAddress === contactsEnums.PrimaryAddress.Business">
                  <label class="label-size">Address:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessAddress"/>
                </div>
                
                <div class="input-line ">
                  <label class="label-size">Skype:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.Skype"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Facebook:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.Facebook"/>
                </div>
                <div class="container-link">
                  <a class="link" @click="changeSmallEditView">Show additional fields</a>
                </div>
              </div>

              <div v-else>
                <div class="input-line">
                  <label class="label-size">Display name:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.FullName"/>
                </div>
                <div class="input-line-select" >
                  <label class="label-size">Email:</label>
                  <q-select outlined dense v-if="aPrimaryMailOptions.length" v-model="oPrimaryEmail" :options="aPrimaryMailOptions" />
                  <div v-else><label class="label-notext-size">Not specified yet</label></div>
                </div>
                <div class="input-line-select">
                  <label class="label-size">Phone:</label>
                  <q-select outlined dense v-if="aPrimaryPhoneOptions.length" v-model="oPrimaryPhone" :options="aPrimaryPhoneOptions" />
                  <div v-else><label class="label-notext-size">Not specified yet</label></div>
                </div>
                <div class="input-line-select">
                  <label class="label-size">Address:</label>
                  <q-select outlined dense v-if="aPrimaryAddressOptions.length" v-model="oPrimaryAddress" :options="aPrimaryAddressOptions" />
                  <div v-else><label class="label-notext-size">Not specified yet</label></div>
                </div>
                <div class="input-line">
                  <label class="label-size">Skype:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.Skype"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Facebook:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.Facebook"/>
                </div>
                <div class="container-link">
                  <a class="link" @click="changeSmallEditView">Hide additional fields</a>
                </div>
                <div class="input-line">
                  <label class="label-size">First name:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.FirstName"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Last name:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.LastName"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Nickname:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.NickName"/>
                </div>

                <q-item-label class="caption-style">Home</q-item-label>

                <div class="input-line">
                  <label class="label-size">Personal E-mail:</label>
                  <q-input outlined dense class="input-size"  v-model="oContact.PersonalEmail"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Street Address:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalAddress"/>
                </div>
                <div class="input-line">
                  <label class="label-size">City:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalCity"/>
                </div>
                <div class="input-line">
                  <label class="label-size">State/Province:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalState"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Zip Code:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalZip"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Country/Region:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalCountry"/>
                </div>
                
                <div class="input-line">
                  <label class="label-size">Web Page:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalWeb"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Fax:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalFax"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Phone:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalPhone"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Mobile:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalMobile"/>
                </div>

                <q-item-label class="caption-style">Business</q-item-label>

                <div class="input-line">
                  <label class="label-size">Business E-mail:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessEmail"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Company:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessCompany"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Department:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessDepartment"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Job Title:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessJobTitle"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Office:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessOffice"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Street Address:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessAddress"/>
                </div>
                <div class="input-line">
                  <label class="label-size">City:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessCity"/>
                </div>
                <div class="input-line">
                  <label class="label-size">State/Province:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessState"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Zip Code:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessZip"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Country/Region:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessCountry"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Web Page:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessWeb"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Fax:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessFax"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Phone:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessPhone"/>
                </div>

                <q-item-label class="caption-style">Other</q-item-label>

                <div class="input-line">
                  <label class="label-size">Birthday:</label>
                  <q-input outlined dense hide-bottom-space class="input-size" v-model="sBirthDate" mask="date" :rules="['date']">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                          <q-date v-model="sBirthDate" @input="() => $refs.qDateProxy.hide()" today-btn minimal/>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="input-line">
                  <label class="label-size">Other E-mail:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.OtherEmail"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Notes:</label>
                  <q-input outlined dense style="flex-grow: 2; max-width: 65%; min-height: 36px;" v-model="oContact.Notes" type="textarea"/>
                </div>

                <q-item-label class="caption-style">PGP Settings</q-item-label>
                <div class="input-line">
                  <label class="label-size">Public PGP key:</label>
                  <q-input outlined dense style="flex-grow: 2; max-width: 65%; min-height: 36px;" v-model="oContact.PublicPgpKey" type="textarea"/>
                </div>
                <div class="input-line" v-if="oContact.OpenPgpKeyUser">{{ oContact.OpenPgpKeyUser }}</div>
                <div class="input-line">If you want messages to this contact to be automatically encrypted and/or signed, check the boxes below. Please note that these messages will be converted to plain text. Attachments will not be encrypted.</div>
                <div class="input-line" v-if="oContact.OpenPgpKeyUser">
                  <q-checkbox v-model="oContact.PgpEncryptMessages" label="Encrypt" />
                </div>
                <div class="input-line" v-if="oContact.OpenPgpKeyUser">
                  <q-checkbox v-model="oContact.PgpSignMessages" label="Sign" />
                </div>

                <q-item-label class="caption-style">Groups</q-item-label>
                <div class="groups-line">
                  <q-checkbox v-model="groupFilteredList" v-for="group in groupList" :key="group.id" :val="group.UUID" :label="group.Name"/>
                </div>
              </div>
            </div>
          </q-scroll-area>
        </div>
        <div class="buttons q-pa-md">
          <q-btn unelevated color="primary" label="Saving..." v-if="bSaving" />
          <q-btn unelevated color="primary" label="Save" v-if="!bSaving" @click="onSave"/>
          <q-btn unelevated color="grey-6" label="Cancel" class="btn-cancel" @click="closeEditContact"/>
        </div>
      </div>
    </div>
  </q-item-section>
</template>

<style lang="scss" scoped>
.head {
  padding: 0 20px;
}

.head--labels-name{
  padding: 15px 0px;
  font-size: 18pt;
  font-weight: normal;
  white-space: normal;
  color: #555566;
}

.frame-top {
  height: 5px; 
  border: 1px solid #ccc;
  border-bottom: 0;
  border-radius: 5px 5px 0px 0px;
}

.frame-without-top {
  border: 1px solid #ccc;
  border-top: 0;
  border-radius: 0px 0px 5px 5px;
  min-height: 200px;
  padding: 8px 0px 12px;
}

.input-line {
  align-items: center;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
}

.input-line-select {
  align-items: center;
  display: flex;
  padding: 10px 20px;
  .label-size {
    flex-grow: 1;
  }
  .q-select {
    max-width: 65%;
    flex-grow: 2;
    text-overflow: ellipsis; 
    overflow: hidden;
  }
}

.input-size {
  flex-grow: 2; 
  max-width: 65%;
}

.label-size {
  flex-grow: 1;
}

.label-notext-size {
  flex-grow: 2;
}

.caption-style {
  margin: 30px 20px; 
  font-size: 10.5pt; 
  color: #3d3d3d; 
  font-weight: 600;
}

.editField {
  width: 100%;
  border-radius: 4px 4px 2px 2px;
  border: 1px solid #d4cece;
  margin-top: 20px;
}

.container-link {
  padding: 0px 20px;
  text-align: right;
}

.link, .link:visited{
  color: #BC4799;
  cursor: pointer;
  text-decoration-line: none;
  text-decoration-style: initial;
  text-decoration-color: initial;
}

.link:hover {
  text-decoration-line:underline
}

.buttons {
  text-align: right;
}

.btn-cancel {
  background: #a7afb9;
}

.groups-line {
  padding: 10px 20px 10px 10px;
  .q-checkbox {
    margin-right: 40px;
  }
}
</style>

<script>
import { ipcRenderer } from 'electron'
import _ from 'lodash'
import moment from 'moment'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types.js'

import contactsEnums from 'src/modules/contacts/enums.js'
import CContact from 'src/modules/contacts/classes/CContact.js'

export default {
  name: 'ContactEditView',
  props: {
    contact: {
      type: Object,
      default: null
    },
  },
  data() {
    return {
      editMode: false,
      oContact: null,
      bSmallEditView: true,
      oPrimaryEmail: contactsEnums.PrimaryEmail.Personal,
      oPrimaryPhone: contactsEnums.PrimaryPhone.Personal,
      oPrimaryAddress: contactsEnums.PrimaryAddress.Personal,
      sBirthDate: '',
      sBirthDatePrev: '',
      groupFilteredList: [],
      bSaving: false,

      contactsEnums: contactsEnums,
    }
  },

  mounted () {
    this.editMode = !!(this.contact && this.contact instanceof CContact)

    let oContact = this.$store.getters['contacts/getNewContactToEdit']
    if (oContact) {
      this.bSmallEditView = false
      this.$store.commit('contacts/setNewContactToEdit', null)
    } else {
      oContact = (this.contact && this.contact instanceof CContact) ? _.cloneDeep(this.contact) : new CContact({})
    }
    this.oContact = oContact

    this.oPrimaryEmail = _.find(this.aPrimaryMailOptions, {'value': oContact.PrimaryEmail})
    this.oPrimaryPhone = _.find(this.aPrimaryPhoneOptions, {'value': oContact.PrimaryPhone})
    this.oPrimaryAddress = _.find(this.aPrimaryAddressOptions, {'value': oContact.PrimaryAddress})

    let iBirthYear = this.oContact.BirthYear ? this.oContact.BirthYear : 2000
    let iBirthMonth = this.oContact.BirthMonth ? this.oContact.BirthMonth : 1
    let iBirthDay = this.oContact.BirthDay ? this.oContact.BirthDay : 1
    this.sBirthDate = moment(iBirthMonth + '-' + iBirthDay + '-' + iBirthYear, 'M-D-YYYY').format('YYYY/MM/DD')
    this.sBirthDatePrev = this.sBirthDate

    this.setFilteredGroups()
    this.initSubscriptions()
  },

  beforeDestroy: function () {
    this.closeEditContact()
    this.destroySubscriptions()
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
    'groupFilteredList': function (v) {
      if (v) {
        this.oContact.GroupUUIDs = v
      }
    },
  },

  computed: {
    'aPrimaryMailOptions': function () {
      let aOptions = []
      if (this.oContact !== null) {
        if (this.oContact.PersonalEmail !== '') {
          aOptions.push({ label: 'Personal: ' + this.oContact.PersonalEmail, value: contactsEnums.PrimaryEmail.Personal })
        }
        if (this.oContact.BusinessEmail !== '') {
          aOptions.push({ label: 'Business: ' + this.oContact.BusinessEmail, value: contactsEnums.PrimaryEmail.Business })
        }
        if (this.oContact.OtherEmail !== '') {
          aOptions.push({ label: 'Other: ' + this.oContact.OtherEmail, value: contactsEnums.PrimaryEmail.Other })
        }
      }

      return aOptions
    },
    'aPrimaryPhoneOptions': function () {
      let aOptions = []
      if (this.oContact !== null) {
        if (this.oContact.PersonalMobile !== '') {
          aOptions.push({ label: 'Mobile: ' + this.oContact.PersonalMobile, value: contactsEnums.PrimaryPhone.Mobile })
        }
        if (this.oContact.PersonalPhone !== '') {
          aOptions.push({ label: 'Personal: ' + this.oContact.PersonalPhone, value: contactsEnums.PrimaryPhone.Personal })
        }
        if (this.oContact.BusinessPhone !== '') {
          aOptions.push({ label: 'Business: ' + this.oContact.BusinessPhone, value: contactsEnums.PrimaryPhone.Business })
        }
      }

      return aOptions
    },
    'aPrimaryAddressOptions': function () {
      let aOptions = []
      if (this.oContact !== null) {
        if (this.oContact.PersonalAddress !== '') {
          aOptions.push({ label: 'Personal: ' + this.oContact.PersonalAddress, value: contactsEnums.PrimaryAddress.Personal })
        }
        if (this.oContact.BusinessAddress !== '') {
          aOptions.push({ label: 'Business: ' + this.oContact.BusinessAddress, value: contactsEnums.PrimaryAddress.Business })
        }
      }

      return aOptions
    },
    'groupList': function () {
        return this.$store.getters['contacts/getGroups']
    },
  },

  methods: {
    onSave () {
      if (this.sBirthDatePrev !== this.sBirthDate) {
        let oBirthDate = moment(this.sBirthDate, 'YYYY/MM/DD')
        this.oContact.BirthYear = oBirthDate.year()
        this.oContact.BirthMonth = oBirthDate.month() + 1
        this.oContact.BirthDay = oBirthDate.date()
      }

      let oContactSource = this.$store.getters['contacts/getCurrentContact']
      let bEqual = _.isEqual(this.oContact, oContactSource)

      if (bEqual) {
        notification.showReport('The contact has not been changed.')
        this.closeEditContact()
      } else {
        let oContactToSave = _.cloneDeep(this.oContact)
        oContactToSave.setViewEmail()
        if (!typesUtils.isNonEmptyString(oContactToSave.Storage)) {
          oContactToSave.Storage = 'personal' // creating contact is allowed only for personal storage
        }
        if (!typesUtils.isNonEmptyString(oContactToSave.ViewEmail) && !typesUtils.isNonEmptyString(oContactToSave.FullName)) {
          notification.showError('At least email address or display name must be set.')
        } else {
          this.bSaving = true
          ipcRenderer.send('contacts-save-contact', {
            sApiHost: this.$store.getters['main/getApiHost'],
            sAuthToken: this.$store.getters['user/getAuthToken'],
            oContactToSave,
          })
        }
      }
    },
    closeEditContact() {
      if (this.editMode) {
        this.$store.dispatch('contacts/closeEditContact')
      } else {
        this.$store.commit('contacts/changeStateForCreatingContact', false)
      }
    },
    onSaveContact (oEvent, { oContactWithUpdatedETag, oError }) {
      this.bSaving = false
      if (oContactWithUpdatedETag) {
        notification.showReport('The contact has been updated.')
        this.$store.commit('contacts/setHasChanges', true)
        this.closeEditContact()
      } else {
        notification.showError(errors.getText(oError, 'Error updating contact.'))
      }
    },
    initSubscriptions () {
      ipcRenderer.on('contacts-save-contact', this.onSaveContact)
    },
    destroySubscriptions () {
      ipcRenderer.removeListener('contacts-save-contact', this.onSaveContact)
    },
    changeSmallEditView() {
      this.bSmallEditView = !this.bSmallEditView
    },
    setFilteredGroups() {
      let groupList =[]

      this.oContact.GroupUUIDs.forEach(element => {
        let group = _.find(this.groupList, { 'UUID': element } )
        if (group) {
          groupList.push(group.UUID)
        }
      })

      this.groupFilteredList = groupList
    },
  },
}
</script>
