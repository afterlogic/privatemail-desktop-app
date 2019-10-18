<template>
  <div>
    <div v-if="contactByUUID.UUID">
      <contactFields v-if="!contactByUUID.editable"/>
      <contactEdit v-if="contactByUUID.editable"/>
    </div>
  </div>
</template>

<style></style>

<script>
import webApi from "src/utils/webApi.js"
import ContactFields from "./ContactFields.vue"
import ContactEdit from "./ContactEdit.vue"

export default {
  name: "Contact",
  components: {
    ContactFields,
    ContactEdit,
  },
  data() {
    return {
      checkboxVal: false,
      editMode: false,
    };
  },

  mounted: function() {},
  watch: {
    // contactByUUID: function(val, oldVal) {
    //   this.contactByUUID()
    // },
  },
  computed: {
    contactByUUID() {
      return this.$store.getters["contacts/getContactByUUID"];
    }     
  },

  methods: { 
    getUUID() {
      console.log('contactByUUID', this.contactByUUID, this.contactByUUID.editable, this.contactByUUID.UUID);
    }     
  }
};
</script>
