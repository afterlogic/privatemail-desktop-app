<template>
<div>
  <MailAccountsSignatureTab :noSignature="bIdentityNoSignature" :signature="sIdentitySignature" :isSaving="bIdentitySaving" :saveSignature="saveIdentitySettings" />
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
    bIdentityNoSignature: {
      type: Boolean
    },
    sIdentitySignature: {
      type: String
    },
    bIdentitySaving: {
      type: Boolean
    },
    saveIdentitySettings: {
      type: Function
    }
  }
}
</script>

<style scoped>

</style>
