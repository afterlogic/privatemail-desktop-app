<template>
    <q-item-section class="column full-height ">
      <div class="col-auto">
        <div class="head">
          <div class="head--labels">
            <q-item-label class="head--labels-name">{{ contact.FullName }}</q-item-label>  
            <q-item-label class="head--labels-email" caption lines="1">{{ contact.ViewEmail }}</q-item-label>
          </div>
          <div class="head--buttons-container-contact">         
            <q-btn class="head--buttons-style" color="primary" label="">Send this contact</q-btn>
            <q-btn class="head--buttons-style" color="primary" label="Email to this contact" />
          </div>
        </div>
      </div>
      
      <div class="col">
        <div class="column full-height">
          <div class="col-auto">
            <q-btn class="btn-edit" color="primary" label="Edit contact" @click="enableEditContact"/>
            <div style="height: 5px; border: 1px solid #ccc; border-bottom: 0; border-radius: 5px 5px 0px 0px; margin: 0px 20px;" ></div>
          </div>
          <div class="col">
            <q-scroll-area class="full-height">
              <div class="" style="border-left: 1px solid #ccc;border-right: 1px solid #ccc;border-bottom: 1px solid #ccc; border-radius: 0px 0px 5px 5px; min-height: 200px; margin: 0px 20px; padding: 1px 0px 0px">
                <q-item-label class="info-line" v-if="contact.FirstName">  First name: {{ contact.FirstName }}</q-item-label>
                <q-item-label class="info-line" v-if="contact.LastName">Last name: {{ contact.LastName }}</q-item-label>
                <q-item-label class="info-line" v-if="contact.Skype">Skype: {{ contact.Skype }}</q-item-label>
                <q-item-label class="info-line" v-if="contact.Facebook">Facebook: {{ contact.Facebook }}</q-item-label>
                <q-item-label class="paragraph-heads" v-if="contact.PersonalEmail || 
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

                <q-item-label class="paragraph-heads" v-if="contact.BusinessEmail || 
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

                <q-item-label class="paragraph-heads" v-if="contact.BirthYear && contact.BirthMonth && contact.BirthDay || 
                  contact.OtherEmail || contact.Notes">Other info</q-item-label>

                <q-item-label class="info-line" v-if="contact.BirthDay">Birthday: {{sBirthDate}}</q-item-label>
                <q-item-label class="info-line" v-if="contact.OtherEmail">Other E-mail: {{ contact.OtherEmail }}</q-item-label>
                <q-item-label class="info-line" v-if="contact.Notes">Notes: {{ contact.Notes }}</q-item-label>

                <q-item-label v-if="groupFilteredList.length" class="paragraph-heads">Groups</q-item-label>

                <div v-if="groupFilteredList" class="groups">
                  <a v-for="(group,index) in groupFilteredList" :key="group.id" class="group" @click="setCurrentGroup(group)">{{group}}<span v-if="index+1 < groupFilteredList.length">,</span></a>
                </div>
              </div>
              
            </q-scroll-area>
          </div>
        </div>
        
        
        
      </div>
    </q-item-section>
</template>

<style scoped>
.container {
  background: #ffffff;
  height: 100%;
  justify-content: unset;
}
.head {
  padding: 15px 20px;
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

.head--buttons-container-contact {
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
  height: auto;
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

.paragraph-heads {
  margin: 30px 0px 30px 20px; 
  font-size: 10.5pt; 
  color: #3d3d3d; 
  font-weight: 600;
}

.info-line {
  margin: 10px 0px 20px 25px;
  font-size: 9pt;
}

.groups {
  margin-left: 20px;
}

.group {
  margin-right: 10px;
  color: #98387b;
  
}

.group:hover {
  text-decoration: underline;
  text-decoration-line: #98387b;
  
  cursor: pointer;
}
</style>

<script>
import CContact from 'src/modules/contacts/classes/CContact.js'
import moment from 'moment'

export default {
  name: 'ContactFields', 
  data() {
    return {
      checkboxVal: false,
      sBirthDate: '',
      groupFilteredList: [],
    }
  },

  mounted: function() { 
    console.log('null year', this.contact)
    this.setBirthDate()

    this.setFilteredGroups()

    
  },
  watch: {
    'contact': function() {
      this.setFilteredGroups()
      this.setBirthDate()
    },
  },
  computed: {
    'groupList': function () {
        return this.$store.getters['contacts/getGroups']
    },
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
    setCurrentGroup (sGroupName) {
      let oGroup = _.find(this.groupList,  { 'Name': sGroupName } )
      this.$store.dispatch('contacts/getContactByUUID', null)
      this.$store.commit('contacts/setCurrentGroup', oGroup)
    },
    setFilteredGroups() {
      let groupList =[]
      this.contact.GroupUUIDs.forEach(element => {
        let group = _.find(this.groupList,  { 'UUID': element } )
        if (group) {

            groupList.push(group.Name)
          }
        })

      this.groupFilteredList = groupList
    },
    setBirthDate() {
      if (this.contact && this.contact.BirthYear && this.contact.BirthMonth && this.contact.BirthDay) {
        let sDate = `${this.contact.BirthYear}-${this.contact.BirthMonth}-${this.contact.BirthDay}`
        this.sBirthDate = `${moment(sDate).format('ll')} ( ${moment(sDate).fromNow(true)} )`
      }
    },
  },
}
</script>
