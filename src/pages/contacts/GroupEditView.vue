<template>

  <div>
    <div v-if="oCurrentGroup">
      <h2>Edit Group</h2>
      
      <div class="editField">        

        <div class="input-line"> <label  style="flex-grow: 1">Group Name:</label><q-input  style="flex-grow: 2; max-width: 65%" outlined v-model="oCurrentGroup.Name" :dense=true> </q-input></div>
        <div class="q-gutter-sm toggle-organization">
          <q-toggle v-model="bIsOrganization" label=" This group is a Company"/>
        </div>
        <div v-if="bIsOrganization">
          <div class="input-line">
            <label>Email:</label>
            <q-input outlined :dense=true v-model="oCurrentGroup.Email"></q-input>
          </div>
          <div class="input-line"> <label style="flex-grow: 1">Company:</label><q-input  style="flex-grow: 2; max-width: 65%" outlined v-model="oCurrentGroup.Company" :dense=true></q-input></div>
          <div class="input-line"> <label style="flex-grow: 1">State:</label><q-input  style="flex-grow: 2; max-width: 65%" outlined v-model="oCurrentGroup.State" :dense=true></q-input></div>
          <div class="input-line"> <label style="flex-grow: 1">City:</label><q-input  style="flex-grow: 2; max-width: 65%" outlined v-model="oCurrentGroup.City" :dense=true></q-input></div>
          <div class="input-line"> <label style="flex-grow: 1">Street:</label><q-input  style="flex-grow: 2; max-width: 65%" outlined v-model="oCurrentGroup.Street" :dense=true></q-input></div>
        
          <div class="input-line"> <label style="flex-grow: 1">Zip:</label><q-input  style="flex-grow: 2; max-width: 65%" outlined v-model="oCurrentGroup.Zip" :dense=true></q-input></div>
          <div class="input-line"> <label style="flex-grow: 1">Phone:</label><q-input  style="flex-grow: 2; max-width: 65%" outlined v-model="oCurrentGroup.Phone" :dense=true></q-input></div>
          <div class="input-line"> <label style="flex-grow: 1">Fax:</label><q-input  style="flex-grow: 2; max-width: 65%" outlined v-model="oCurrentGroup.Fax" :dense=true></q-input></div>
          <div class="input-line"> <label style="flex-grow: 1">Web:</label><q-input  style="flex-grow: 2; max-width: 65%" outlined v-model="oCurrentGroup.Web" :dense=true></q-input></div>
        </div>
      </div>
      <div class="buttons">
        <q-btn color="primary" style="margin: 10px;" label="Save" @click="onSave"/>
        <q-btn color="grey-6" label="Cancel" class="btn-cancel" @click="disableEditGroup"/>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.input-line {
  align-items: center;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;

  & > label {
    flex-grow: 1;
  }
  .q-input {
    flex-grow: 2;
    max-width: 65%;
  }
}

.editField {
  width: 100%;
  border-radius: 4px 4px 2px 2px;
  border: 1px solid #d4cece;
  /* box-shadow: 0 1px 0px 0 grey;  */
  margin-top: 20px;
}

.toggle-organization {
  transform: none;
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
import CGroup from 'src/modules/contacts/classes/CGroup.js'

export default {
  name: 'ContactEditView',
  data() {
    return {
      oCurrentGroup: null,
      bIsOrganization: false,
    }
  },

  mounted: function() {
    let oGroupContainer = this.$store.getters['contacts/getCurrentGroup']
    let oCurrentGroup = _.cloneDeep(oGroupContainer.group)
    this.oCurrentGroup = (oCurrentGroup && oCurrentGroup instanceof CGroup) ? oCurrentGroup : null
    this.bIsOrganization = this.oCurrentGroup.IsOrganization
  },
  beforeDestroy: function () {
    this.disableEditGroup()
  },
  watch: {
    'bIsOrganization': function (v) {
      if (v) {
        this.oCurrentGroup.IsOrganization = v.value
      }
    },  
  },
  computed: {
  },

  methods: {
    onSave () {
        let oGroupContainer = this.$store.getters['contacts/getCurrentGroup']
        let oCurrentGroup = _.cloneDeep(oGroupContainer.group)
        let oSavedGroup = null
        let bEqual = _.isEqual(this.oCurrentGroup, oCurrentGroup)
       
        if (!bEqual) {
          oSavedGroup = _.cloneDeep(this.oCurrentGroup)
        }

        this.disableEditGroup()
    },

    disableEditGroup() {
      this.$store.dispatch('contacts/disableEditGroup')
    },

    changeSmallEditView() {
      this.bIsOrganization = !this.bIsOrganization
    },
  },
}
</script>
