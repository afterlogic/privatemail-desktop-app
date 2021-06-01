<template>
<div>
  <MailAccountsSignatureTab :noSignature="bAliasNoSignature" :signature="sAliasSignature" :isSaving="bAliasSaving" :saveSignature="saveAliasSettings" />
</div>
</template>

<script>
import MailAccountsSignatureTab from '../MailAccountsSignatureTab.vue'

export default {
  name: "Signature",
  components: {
    MailAccountsSignatureTab
  },
  props: {
    bAliasNoSignature: {
      type: Boolean
    },
    sAliasSignature: {
      type: String
    },
    bAliasSaving: {
      type: Boolean
    },
    saveAliasSettings: {
      type: Function
    }
  }
}
</script>

<style scoped>

</style>
