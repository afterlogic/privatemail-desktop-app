<template>
<div>
  <MailAccountsSignatureTab :noSignature="bIdentityNoSignature" :signature="sIdentitySignature" :isSaving="bIdentitySaving" :saveSignature="saveIdentitySettings" ref="signature"/>
  <UnsavedChangesDialog ref="unsavedChangesDialog" />
</div>
</template>

<script>
import MailAccountsSignatureTab from '../MailAccountsSignatureTab.vue'
import UnsavedChangesDialog from "../../../UnsavedChangesDialog";
export default {
  name: "Signature",
  components: {
    MailAccountsSignatureTab,
    UnsavedChangesDialog
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
  },
  beforeRouteUpdate(to, from, next) {
    if (this.$refs.signature.hasChanges() && _.isFunction(this?.$refs?.unsavedChangesDialog?.openConfirmDiscardChangesDialog)) {
      this.$refs.unsavedChangesDialog.openConfirmDiscardChangesDialog(next)
    } else {
      next()
    }
  },
  beforeRouteLeave (to, from, next) {
    if (this.$refs.signature.hasChanges() && _.isFunction(this?.$refs?.unsavedChangesDialog?.openConfirmDiscardChangesDialog)) {
      this.$refs.unsavedChangesDialog.openConfirmDiscardChangesDialog(next)
    } else {
      next()
    }
  },
  methods: {
    hasChanges () {
      return this.$refs.signature.hasChanges()
    },
    populate () {
      return this.$refs.signature.populate()
    }
  }
}
</script>

<style scoped>

</style>
