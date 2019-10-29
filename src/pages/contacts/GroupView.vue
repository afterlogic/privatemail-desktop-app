<template>
  <div>
    <div v-if="oCurrentGroup">
      <q-item-section >
        <div class="head">
          <div class="head--labels">
            <q-item-label class="head--labels-name">View Group</q-item-label>  
          </div>
          <div class="head--buttons-container">        
            <q-btn class="head--buttons-style head--buttons-off" flat unelevated color="grey-7" label="Save this group" />
            <q-btn class="head--buttons-style head--buttons-off" flat unelevated color="grey-7" label="Edit group" @click="enableEditGroup"/>
            <q-btn class="head--buttons-style" color="primary" label="Email to this group" />
            
          </div>
        </div>

        
        <div class="content-area">          

          <q-item-label class="info-line" v-if="oCurrentGroup.Name">Group Name: {{ oCurrentGroup.Name }}</q-item-label>
          <q-item-label class="info-line" v-if="oCurrentGroup.Email">Email: {{ oCurrentGroup.Email }}</q-item-label>
          <q-item-label class="info-line" v-if="oCurrentGroup.Company">Company: {{ oCurrentGroup.Company }}</q-item-label>
          <q-item-label class="info-line" v-if="oCurrentGroup.State">State: {{ oCurrentGroup.State }}</q-item-label>
          <q-item-label class="info-line" v-if="oCurrentGroup.City">City: {{ oCurrentGroup.City }}</q-item-label>
          <q-item-label class="info-line" v-if="oCurrentGroup.Street">Street: {{ oCurrentGroup.Street }}</q-item-label>
          <q-item-label class="info-line" v-if="oCurrentGroup.Zip">Zip: {{ oCurrentGroup.Zip }}</q-item-label>
          <q-item-label class="info-line" v-if="oCurrentGroup.Phone">Phone: {{ oCurrentGroup.Phone }}</q-item-label>
          <q-item-label class="info-line" v-if="oCurrentGroup.Fax">Fax: {{ oCurrentGroup.Fax }}</q-item-label>
          <q-item-label class="info-line" v-if="oCurrentGroup.Web">Web: {{ oCurrentGroup.Web }}</q-item-label>
            
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

.labels-email {
  color: #BC4799;
  font-size: 10.5pt;
  font-weight: bold;
  text-decoration: none;
}

.head--buttons-container {
  display: flex;
  justify-content: space-between;
  width: 70%;
}

.head--buttons-style {
  width: 30%;
  min-width: 85px;
  height: 34px;
  margin: 0px 3px;
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

.head--buttons-off {
  border-radius: none;
  background: none;
  border: none;
  text-shadow: none;
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
import CGroup from 'src/modules/contacts/classes/CGroup.js'

export default {
  name: 'GroupView',
  data() {
    return {
      // checkboxVal: false,
      // sBirthDate: '',
      bIsOrganization: null,
    }
  },

  mounted: function() {     

  },
  watch: {},
  computed: {
    'oCurrentGroup': function() {
      let currentGroup = this.$store.getters['contacts/getCurrentGroup']
      console.log('group', currentGroup)
      return (currentGroup && currentGroup instanceof CGroup) ? currentGroup : null
    },
  },

  methods: {
    enableEditGroup() {
      this.$store.dispatch('contacts/enableEditContact')
    },
  },
}
</script>
