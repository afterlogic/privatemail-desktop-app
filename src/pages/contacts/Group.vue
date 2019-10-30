<template>
  <div>
    <div v-if="oCurrentContact">
      <GroupView v-if="!oCurrentContact.editable"/>
      <GroupEditView v-if="oCurrentContact.editable"/>
    </div>
  </div>
</template>

<style>
</style>

<script>
import GroupView from './GroupView.vue'
import GroupEditView from './GroupEditView.vue'

export default {
  name: 'Group',
  data() {
    return {
      // checkboxVal: false,
      // sBirthDate: '',
    }
  },

  components: {
    GroupView,
    GroupEditView,
  },

  mounted: function() {     

  },
  watch: {},
  computed: {
    'oCurrentContact': function () {
      return this.$store.getters['contacts/getCurrentGroup']
    }
  },

  methods: {

  },
}
</script>
