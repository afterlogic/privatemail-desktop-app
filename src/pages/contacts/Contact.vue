<template>

  <div v-if="contactByUUID.UUID">
    <contactFields />
    <contactEdit />
  </div>
</template>

<style></style>

<script>
//import {contacts, contactsOffline} from "../../contactsData.js"
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
      checkboxVal: false
    };
  },

  mounted: function() {},
  watch: {},
  computed: {
    contactByUUID() {
      return this.$store.getters["contacts/getContactByUUID"];
    }
  },

  methods: {}
};
</script>
