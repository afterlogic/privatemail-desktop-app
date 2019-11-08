<template>
  <q-item-section v-if="oCurrentGroup" class="column full-height container">
    <div class="head col-auto">
      <div class="head--labels">
        <q-item-label class="head--labels-name">View Group</q-item-label>
      </div>
      <div class="buttons">
        <q-btn no-wrap no-caps class="head--buttons-off" flat unelevated color="grey-7" label="Delete group" />
        <q-btn no-wrap no-caps class="head--buttons-off" flat unelevated color="grey-7" label="Edit group" @click="enableEditGroup"/>
        <q-btn no-wrap no-caps color="primary" label="Email to this group" />
        
      </div>
    </div>

    <div class="col">
      <div class="column full-height">
        <div class="col">
          <q-scroll-area class="full-height">    
            <div style="border: 1px solid #ccc; border-radius: 5px 5px 5px 5px; min-height: 200px; padding: 1px 0px 0px">

              <q-item-label class="info-line" v-if="oCurrentGroup.Name"><span class="label-names">Group Name:</span> {{ oCurrentGroup.Name }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.Email"><span class="label-names">Email: </span>{{ oCurrentGroup.Email }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.Company"><span class="label-names">Company: </span>{{ oCurrentGroup.Company }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.State"><span class="label-names">State: </span>{{ oCurrentGroup.State }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.City"><span class="label-names">City: </span>{{ oCurrentGroup.City }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.Street"><span class="label-names">Street: </span>{{ oCurrentGroup.Street }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.Zip"><span class="label-names">Zip: </span>{{ oCurrentGroup.Zip }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.Phone"><span class="label-names">Phone: </span>{{ oCurrentGroup.Phone }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.Fax"><span class="label-names">Fax: </span>{{ oCurrentGroup.Fax }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.Web"><span class="label-names">Web: </span>{{ oCurrentGroup.Web }}</q-item-label>
            </div>
          </q-scroll-area>
        </div>
      </div>
    </div>
  </q-item-section>
</template>

<style scoped>
.container{
  padding: 0px 20px;
}
.head {
  padding: 15px 0px 21px 0px;
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

.label-names {
  margin-right: 3%;
}

.head--buttons-off {
  border-radius: none;
  background: none;
  border: none;
  text-shadow: none;
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
      let oGroupContainer = this.$store.getters['contacts/getCurrentGroup']
      let oCurrentGroup = _.cloneDeep(oGroupContainer.group)
      console.log(oCurrentGroup instanceof CGroup)
      return (oCurrentGroup && oCurrentGroup instanceof CGroup) ? oCurrentGroup : null
    },
  },

  methods: {
    enableEditGroup() {
      this.$store.dispatch('contacts/enableEditGroup')
    },
  },
}
</script>
