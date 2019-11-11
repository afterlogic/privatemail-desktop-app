<template>
  <q-item-section v-if="oGroup" class="column full-height">
    <div class="col-auto">
      <div class="head">
        <q-item-label class="head--labels-name">Edit Group</q-item-label>
      </div>
    </div>
    <div class="frame-top q-mx-md"></div>
    <div class="col">
      <div class="column full-height">
        <div class="col">
          <q-scroll-area class="editField full-height">
            <div class="frame-without-top q-mx-md">
              <div class="input-line">
                <label class="label-size">Group Name:</label>
                <q-input outlined dense class="input-size" v-model="oGroup.Name"/>
              </div>
              <div class="q-gutter-sm toggle-organization">
                <q-toggle v-model="bIsOrganization" label=" This group is a Company"/>
              </div>
              <div v-if="bIsOrganization">
                <div class="input-line">
                  <label>Email:</label>
                  <q-input outlined :dense=true v-model="oGroup.Email"></q-input>
                </div>
                <div class="input-line">
                  <label class="label-size">Company:</label>
                  <q-input outlined dense class="input-size" v-model="oGroup.Company"/>
                </div>
                <div class="input-line">
                  <label class="label-size">State:</label>
                  <q-input outlined dense class="input-size" v-model="oGroup.State"/></div>
                <div class="input-line">
                  <label class="label-size">City:</label>
                  <q-input outlined dense class="input-size" v-model="oGroup.City"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Street:</label>
                  <q-input outlined dense class="input-size" v-model="oGroup.Street"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Zip:</label>
                  <q-input outlined dense class="input-size" v-model="oGroup.Zip"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Phone:</label>
                  <q-input outlined dense class="input-size" v-model="oGroup.Phone"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Fax:</label>
                  <q-input outlined dense class="input-size" v-model="oGroup.Fax"/>
                </div>
                <div class="input-line">
                  <label class="label-size">Web:</label>
                  <q-input outlined dense class="input-size" v-model="oGroup.Web"/>
                </div>
              </div>
            </div>
          </q-scroll-area>
        </div>
        <div class="buttons q-pa-md">
          <q-btn unelevated color="primary" label="Save" @click="onSave"/>
          <q-btn unelevated class="btn-cancel" color="grey-6" label="Cancel" @click="disableCreatingGroup"/>
        </div>
      </div>
    </div>
  </q-item-section>
</template>

<style lang="scss" scoped>
.column {
  justify-content: unset;
}

.head {
  padding: 0 20px;
}

.head--labels-name{
  padding: 15px 0px 21px 0px;
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
  padding: 1px 0px 0px
}

.input-size {
  flex-grow: 2; 
  max-width: 65%;
}

.label-size {
  flex-grow: 1;
}

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
  text-align: right;
}

.btn-cancel {
  background: #a7afb9;
}
</style>

<script>
import CGroup from 'src/modules/contacts/classes/CGroup.js'

export default {
  name: 'GroupCreateView',
  data() {
    return {
      oGroup: null,
      bIsOrganization: false,
    }
  },

  mounted: function() {
    this.oGroup = new CGroup({})
    this.bIsOrganization = this.oGroup.IsOrganization ? this.oGroup.IsOrganization : false
  },
  beforeDestroy: function () {
    this.disableCreatingGroup()
  },
  watch: {
    'bIsOrganization': function (v) {
      if (v) {
        this.oGroup.IsOrganization = v.value
      }
    },  
  },
  computed: {
  },

  methods: {
    onSave () {
        let oGroup = this.oGroup
        console.log('create new group')

        this.disableCreatingGroup()
    },

    disableCreatingGroup() {
      this.$store.commit('contacts/changeStateForCreatingGroup', false)
    },

    changeSmallEditView() {
      this.bIsOrganization = !this.bIsOrganization
    },
  },
}
</script>
