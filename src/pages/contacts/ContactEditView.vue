<template>
  <q-item-section class="column full-height" style="padding: 0px 20px;">
    <div class="col-auto">
      <div class="head">
        <q-item-label class="head--labels-name">Edit Contact</q-item-label>
      </div>
    </div>
    <div class="col">
      <div class="column full-height">
        <div class="col">
          <q-scroll-area class="editField full-height" v-if="oContact">
            <div v-if="bSmallEditView">
              <div class="input-line">
                <label class="label-size">Display name:</label>
                <q-input class="input-size" outlined v-model="oContact.FullName" :dense=true ></q-input>
              </div>

              <div class="input-line" v-if="oContact.PrimaryEmail === 0">
                <label class="label-size">Email:</label>
                <q-input class="input-size" outlined v-model="oContact.PersonalEmail" :dense=true></q-input>
              </div>
              <div class="input-line" v-if="oContact.PrimaryEmail === 1">
                <label class="label-size">Email:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessEmail" :dense=true></q-input>
              </div>
              <div class="input-line" v-if="oContact.PrimaryEmail === 2">
                <label class="label-size">Email:</label>
                <q-input class="input-size" outlined v-model="oContact.OtherEmail" :dense=true></q-input>
              </div>

              <div class="input-line" v-if="oContact.PrimaryPhone === 0">
                <label class="label-size">Phone:</label>
                <q-input class="input-size" outlined v-model="oContact.PersonalMobile" :dense=true></q-input>
              </div>
              <div class="input-line" v-if="oContact.PrimaryPhone === 1">
                <label class="label-size">Phone:</label>
                <q-input class="input-size" outlined v-model="oContact.PersonalPhone" :dense=true></q-input>
              </div>
              <div class="input-line" v-if="oContact.PrimaryPhone === 2">
                <label class="label-size">Phone:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessPhone" :dense=true></q-input>
              </div>

              <div class="input-line" v-if="oContact.PrimaryAddress === 0">
                <label class="label-size">Address:</label>
                <q-input class="input-size" outlined v-model="oContact.PersonalAddress" :dense=true></q-input>
              </div>
              <div class="input-line" v-if="oContact.PrimaryAddress === 1">
                <label class="label-size">Address:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessAddress" :dense=true></q-input>
              </div>
              
              <div class="input-line ">
                <label class="label-size">Skype:</label>
                <q-input class="input-size" outlined v-model="oContact.Skype" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Facebook:</label>
                <q-input class="input-size" outlined v-model="oContact.Facebook" :dense=true></q-input>
              </div>
              <div class="container-link">
                <a class="link" @click="changeSmallEditView">Show additional fields</a>
              </div>
            </div>

            <div v-else>
              <div class="input-line">
                <label class="label-size">Display name:</label>
                <q-input class="input-size" outlined v-model="oContact.FullName" :dense=true></q-input>
              </div>
              <div class="input-line" >
                <label class="label-size">Email:</label>
                <q-select v-if="aPrimaryMailOptions.length" v-model="oPrimaryEmail" :options="aPrimaryMailOptions" outlined dense />
                <div v-else><label class="label-notext-size"> Not specified yet</label></div>
              </div>
              <div class="input-line">
                <label class="label-size">Phone:</label>
                <q-select outlined v-if="aPrimaryPhoneOptions.length" v-model="oPrimaryPhone" :options="aPrimaryPhoneOptions" dense />
                <div v-else><label class="label-notext-size"> Not specified yet</label></div>
              </div>
              <div class="input-line">
                <label class="label-size">Address:</label>
                <q-select v-if="aPrimaryAddressOptions.length" outlined v-model="oPrimaryAddress" :options="aPrimaryAddressOptions" dense />
                <div v-else><label class="label-notext-size"> Not specified yet</label></div>
              </div>
              <div class="input-line">
                <label class="label-size">Skype:</label>
                <q-input class="input-size" outlined v-model="oContact.Skype" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Facebook:</label>
                <q-input class="input-size" outlined v-model="oContact.Facebook" :dense=true></q-input>
              </div>
              <div class="container-link">
                <a class="link" @click="changeSmallEditView">Hide additional fields</a>
              </div>
              <div class="input-line">
                <label class="label-size">First name:</label>
                <q-input class="input-size" outlined v-model="oContact.FirstName" :dense=true ></q-input>
              </div>
              
              <div class="input-line">
                <label class="label-size">Last name:</label>
                <q-input class="input-size" outlined v-model="oContact.LastName" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Nickname:</label>
                <q-input class="input-size" outlined v-model="oContact.NickName" :dense=true></q-input>
              </div>
              
              <q-item-label class="caption-style">Home</q-item-label>

              <div class="input-line">
                <label class="label-size">Personal E-mail:</label>
                <q-input class="input-size" outlined v-model="oContact.PersonalEmail" :dense=true> </q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Street Address:</label>
                <q-input class="input-size" outlined v-model="oContact.PersonalAddress" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">City:</label>
                <q-input class="input-size" outlined v-model="oContact.PersonalCity" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">State/Province:</label>
                <q-input class="input-size" outlined v-model="oContact.PersonalState" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Zip Code:</label>
                <q-input class="input-size" outlined v-model="oContact.PersonalZip" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Country/Region:</label>
                <q-input class="input-size" outlined v-model="oContact.PersonalCountry" :dense=true></q-input>
              </div>
              
              <div class="input-line">
                <label class="label-size">Web Page:</label>
                <q-input class="input-size" outlined v-model="oContact.PersonalWeb" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Fax:</label>
                <q-input class="input-size" outlined v-model="oContact.PersonalFax" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Phone:</label>
                <q-input class="input-size" outlined v-model="oContact.PersonalPhone" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Mobile:</label>
                <q-input class="input-size" outlined v-model="oContact.PersonalMobile" :dense=true></q-input>
              </div>

              <q-item-label class="caption-style">Business</q-item-label>

              <div class="input-line">
                <label class="label-size">Business E-mail:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessEmail" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Company:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessCompany" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Department:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessDepartment" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Job Title:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessJobTitle" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Office:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessOffice" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Street Address:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessAddress" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">City:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessCity" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">State/Province:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessState" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Zip Code:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessZip" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Country/Region:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessCountry" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Web Page:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessWeb" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Fax:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessFax" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Phone:</label>
                <q-input class="input-size" outlined v-model="oContact.BusinessPhone" :dense=true></q-input>
              </div>

              <q-item-label class="caption-style">Other</q-item-label>

              <div class="input-line">
                <label class="label-size">Birthday:</label>
                <!-- <div class="q-pa-md" style="max-width: 55.5%; margin: 15px -16px 0px 0px;"> -->
                  <q-input class="input-size" outlined dense v-model="date" mask="date" :rules="['date']" @change="console">
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
                <q-input class="input-size" outlined v-model="oContact.OtherEmail" :dense=true></q-input>
              </div>
              <div class="input-line">
                <label class="label-size">Notes:</label>
                <q-input style="flex-grow: 2; max-width: 65%; min-height: 36px;" outlined :dense=true v-model="oContact.Notes" type="textarea"/>
              </div>
              
              <q-item-label class="caption-style">Groups</q-item-label>
              <div class="groups">
                <q-checkbox v-model="groupFilteredList" v-for="group in groupList" :key="group.id" :val="group.UUID" :label="group.Name"/>
              </div>
            
            
            </div>
          </q-scroll-area>
        </div>
        <div class="buttons">
          <q-btn color="primary" style="margin: 10px;" label="Save" @click="onSave"/>
          <q-btn color="grey-6" label="Cancel" class="btn-cancel" @click="disableEditContact"/>
        </div>
      </div>
    </div>
  </q-item-section>
</template>

<style scoped>
.head--labels-name{
  padding: 15px 0px;
  font-size: 18pt;
  font-weight: normal;
  white-space: normal;
  color: #555566;
}

.input-line {
  align-items: center;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
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
      groupFilteredList: [],
    }
  },

  mounted: function() {
    let ContactByUUID = this.$store.getters['contacts/getContactByUUID']
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

    console () {
      console.log(this.date)
    }
  },
}
</script>
