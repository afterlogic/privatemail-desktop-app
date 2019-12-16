<template>
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
      <q-item-label class="info-line" v-if="contact.FirstName"> First name: {{ contact.FirstName }}</q-item-label>
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
    </q-item-section>
    </q-card-section>

    <q-separator />

    <q-card-actions>
      <q-btn @click="dummyAction" flat>Send this contact</q-btn>
      <q-btn @click="emailToContact" flat>Email to this contact</q-btn>
    </q-card-actions>
  </q-card>
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
  align-items: center;
  flex-wrap: wrap;
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
  white-space: nowrap;
}

.frame-without-top {
  border: 1px solid #ccc;
  border-top: 0px;
  border-radius: 0px 0px 5px 5px;
  min-height: 200px;
  margin: 0px 20px;
  padding: 8px 0px 12px;
 }

.btn-edit {
  margin: 20px 40px 0px 0px;
  position: absolute;
  right: 0px;
  z-index: 1;
}

.info-main {
  display: flex;
}

.paragraph-heads {
  margin: 30px 0px 30px 25px; 
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
import moment from 'moment'

import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types'

import CContact from 'src/modules/contacts/classes/CContact.js'

export default {
  name: 'ContactFields',

  props: ['contact'],

  data() {
    return {
      sBirthDate: '',
    }
  },

  mounted: function() {
    this.setBirthDate()
  },

  watch: {
    'contact': function() {
      this.setBirthDate()
    },
  },

  computed: {
    'groupList': function () {
        return this.$store.getters['contacts/getGroups']
    },
  },

  methods: {
    setBirthDate() {
      if (this.contact && this.contact.BirthYear && this.contact.BirthMonth && this.contact.BirthDay) {
        let sDate = `${this.contact.BirthYear}-${this.contact.BirthMonth}-${this.contact.BirthDay}`
        this.sBirthDate = `${moment(sDate).format('ll')} ( ${moment(sDate).fromNow(true)} )`
      }
    },
    emailToContact () {
      let sToAddr = this.contact.getFull()
      this.openCompose({ sToAddr })
    },
    dummyAction() {
      notification.showReport('There is no action here yet')
    },
  },
}
</script>
