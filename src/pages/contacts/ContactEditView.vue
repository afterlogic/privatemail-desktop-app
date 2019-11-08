<template>
  <q-item-section class="column full-height">
    <div class="col-auto">
      <div class="head">
        <q-item-label class="head--labels-name">Edit Contact</q-item-label>
      </div>
    </div>
    <div class="frame-top"></div>
    <div class="col">
      <div class="column full-height">
        <div class="col">
          <q-scroll-area v-if="oContact" class="full-height" >
            <div class="frame-without-top">
              <div v-if="bSmallEditView">
                <div class="input-line">
                  <label class="label-size">Display name:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.FullName"/>
                </div>

                <div class="input-line" v-if="oContact.PrimaryEmail === 0">
                  <label class="label-size">Email:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalEmail"/>
                </div>
                <div class="input-line" v-if="oContact.PrimaryEmail === 1">
                  <label class="label-size">Email:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessEmail"/>
                </div>
                <div class="input-line" v-if="oContact.PrimaryEmail === 2">
                  <label class="label-size">Email:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.OtherEmail"/>
                </div>

                <div class="input-line" v-if="oContact.PrimaryPhone === 0">
                  <label class="label-size">Phone:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalMobile"/>
                </div>
                <div class="input-line" v-if="oContact.PrimaryPhone === 1">
                  <label class="label-size">Phone:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalPhone"/>
                </div>
                <div class="input-line" v-if="oContact.PrimaryPhone === 2">
                  <label class="label-size">Phone:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.BusinessPhone"/>
                </div>

                <div class="input-line" v-if="oContact.PrimaryAddress === 0">
                  <label class="label-size">Address:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.PersonalAddress"/>
                </div>
                <div class="input-line" v-if="oContact.PrimaryAddress === 1">
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
                  <!-- <div class="q-pa-md" style="max-width: 55.5%; margin: 15px -16px 0px 0px;"> -->
                    <q-input outlined dense class="input-size" v-model="date" mask="date" :rules="['date']" @change="console">
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                            <q-date v-model="date" @input="() => $refs.qDateProxy.hide()" today-btn minimal/>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  <!-- </div> -->
                </div>
                
                <div class="input-line">
                  <label class="label-size">Other E-mail:</label>
                  <q-input outlined dense class="input-size" v-model="oContact.OtherEmail"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Notes:</label>
                  <q-input outlined dense style="flex-grow: 2; max-width: 65%; min-height: 36px;" v-model="oContact.Notes" type="textarea"/>
                </div>
                
                <q-item-label class="caption-style">Groups</q-item-label>
                <div class="groups">
                  <q-checkbox v-model="groupFilteredList" v-for="group in groupList" :key="group.id" :val="group.UUID" :label="group.Name"/>
                </div>
              </div>
            </div>
          </q-scroll-area>
        </div>
        <div class="buttons">
          <q-btn unelevated color="primary" label="Save" @click="onSave"/>
          <q-btn unelevated color="grey-6" label="Cancel" class="btn-cancel" @click="disableEditContact"/>
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
  margin: 0px 20px;
}

.frame-without-top {
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc; 
  border-radius: 0px 0px 5px 5px; 
  min-height: 200px; 
  margin: 0px 20px; 
  padding: 1px 0px 0px
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
  margin: 30px 0px 30px 20px; 
  font-size: 10.5pt; 
  color: #3d3d3d; 
  font-weight: 600;
}
.editField {
  width: 100%;
  border-radius: 4px 4px 2px 2px;
  border: 1px solid #d4cece;
  /* box-shadow: 0 1px 0px 0 grey;  */
  margin-top: 20px;
}

.container-link {
    /* width: 32%;
    width: 150px;
    position: absolute;
    right: 3%; */
    padding: 0px 20px;
    text-align: right;
    /* white-space: nowrap;
    text-overflow: ellipsis;
    width: 100%;
    overflow: hidden; */
}

.link, .link:visited{
    color: #BC4799;
    cursor: pointer;
    /* margin-left: 75%; */
    text-decoration-line: none;
    text-decoration-style: initial;
    text-decoration-color: initial;
}

.link:hover {
  text-decoration-line:underline
}

.buttons {
  margin: 30px 0;
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
      groupFilteredList: [],
    }
  },

  mounted: function() {
    let ContactByUUID = this.$store.getters['contacts/getCurrentContact']
    let oContact = _.cloneDeep(ContactByUUID.contact)
    this.oContact = (oContact && oContact instanceof CContact) ? oContact : null
    // console.log('uuids', this.oContact.GroupUUIDs)

    this.oPrimaryEmail = _.find(this.aPrimaryMailOptions, {'value': oContact.PrimaryEmail})
    this.oPrimaryPhone = _.find(this.aPrimaryPhoneOptions, {'value': oContact.PrimaryPhone})
    this.oPrimaryAddress = _.find(this.aPrimaryAddressOptions, {'value': oContact.PrimaryAddress})

    this.oContact.BirthYear = this.oContact.BirthYear ? this.oContact.BirthYear : '2000'

    this.oContact.BirthMonth = this.oContact.BirthMonth ? this.oContact.BirthMonth : '01'
    this.oContact.BirthMonth = this.oContact.BirthMonth.length > 1 ? this.oContact.BirthMonth : '0' + this.oContact.BirthMonth

    this.oContact.BirthDay = this.oContact.BirthDay ? this.oContact.BirthDay : '01'
    this.oContact.BirthDay = this.oContact.BirthDay.length > 1 ? this.oContact.BirthDay : '0' + this.oContact.BirthDay
    this.date = this.oContact.BirthYear + '/' + this.oContact.BirthMonth + '/' + this.oContact.BirthDay

    this.setFilteredGroups()

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
          aOptions.push({ label: 'Personal: ' + this.oContact.PersonalEmail, value: 0 })
        }
        if (this.oContact.BusinessEmail !== '') {
          aOptions.push({ label: 'Business: ' + this.oContact.BusinessEmail, value: 1 })
        }
        if (this.oContact.OtherEmail !== '') {
          aOptions.push({ label: 'Other: ' + this.oContact.OtherEmail, value: 2 })
        }
      }

      return aOptions
    },
    'aPrimaryPhoneOptions': function () {
      let aOptions = []
      if (this.oContact !== null) {
        if (this.oContact.PersonalMobile !== '') {
          aOptions.push({ label: 'Mobile: ' + this.oContact.PersonalMobile, value: 0 })
        }
        if (this.oContact.PersonalPhone !== '') {
          aOptions.push({ label: 'Personal: ' + this.oContact.PersonalPhone, value: 1 })
        }
        if (this.oContact.BusinessPhone !== '') {
          aOptions.push({ label: 'Business: ' + this.oContact.BusinessPhone, value: 2 })
        }
      }

      return aOptions
    },
    'aPrimaryAddressOptions': function () {
      let aOptions = []
      if (this.oContact !== null) {
        if (this.oContact.PersonalAddress !== '') {
          aOptions.push({ label: 'Personal: ' + this.oContact.PersonalAddress, value: 0 })
        }
        if (this.oContact.BusinessAddress !== '') {
          aOptions.push({ label: 'Business: ' + this.oContact.BusinessAddress, value: 1 })
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
        let ContactByUUID = this.$store.getters['contacts/getCurrentContact']
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

    setFilteredGroups() {
      let groupList =[]
        
      this.oContact.GroupUUIDs.forEach(element => {
        let group = _.find(this.groupList,  { 'UUID': element } )
        if (group) {

            groupList.push(group.UUID)
          }
        })

      this.groupFilteredList = groupList
    },

    console() {
      console.log(this.date)
    }
  },
}
</script>
