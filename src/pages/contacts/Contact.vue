<template>
  <div class="full-height">
    <contactView v-if="!contactByUUID.editable"/>
    <contactEditView v-if="contactByUUID.editable"/>
  </div>
</template>

<style>
</style>

<script>
import webApi from 'src/utils/webApi.js'
import ContactView from './ContactView.vue'
import ContactEditView from './ContactEditView.vue'

export default {
  name: 'Contact',
  components: {
    ContactView,
    ContactEditView,
  },
  data() {
    return {
      checkboxVal: false,
      editMode: false,
    }
  },

  mounted: function() {},
  watch: {
    // contactByUUID: function(val, oldVal) {
    //   this.contactByUUID()
    // },
  },
  computed: {
    contactByUUID() {
      return this.$store.getters['contacts/getCurrentContact']
    }
  },

  methods: {
    getUUID() {
      console.log('contactByUUID', this.contactByUUID, this.contactByUUID.editable, this.contactByUUID.UUID)
    }
  },
}
</script>
