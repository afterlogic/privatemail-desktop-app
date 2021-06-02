<template>
<div>
  <MailAccountsSignatureTab :noSignature="bAliasNoSignature" :signature="sAliasSignature" :isSaving="bAliasSaving" :saveSignature="saveAliasSettings" ref="signature"/>
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
}
</script>

<style scoped>

</style>
