<template>
  <div  class="full-height">
    <GroupView v-if="!oCurrentGroup.editable"/>
    <GroupEditView v-if="oCurrentGroup.editable"/>
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
    'oCurrentGroup': function () {
      return this.$store.getters['contacts/getCurrentGroup']
    }
  },

  methods: {

  },
}
</script>
