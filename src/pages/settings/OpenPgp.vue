<template>
  <div>
    <div class="text-h4 q-mb-md">Open PGP</div>
    <q-separator spaced />
    <q-list>
      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="enableOpenPgp" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Enable OpenPGP</q-item-label>
          <q-item-label caption>
            Be aware of "Allow autosave in Drafts" setting in Mail module. Turn it off if you don't want the server to store unencrypted drafts. You will still be able to save drafts manually (Ctrl-S).
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator spaced />
      <q-btn color="primary" label="Save" />

      <q-separator spaced />
      <q-item-label header>Public keys</q-item-label>
      <q-item v-ripple>
        <q-item-section>
          <q-item-label>test2@afterlogic.com</q-item-label>
        </q-item-section>
        <q-item-section side >
          <q-btn flat icon="visibility" />
        </q-item-section>
        <q-item-section side >
          <q-btn flat icon="delete" />
        </q-item-section>
      </q-item>

      <q-item-label header>Private keys</q-item-label>
      <q-item v-ripple>
        <q-item-section>
          <q-item-label>test2@afterlogic.com</q-item-label>
        </q-item-section>
        <q-item-section side >
          <q-btn flat icon="visibility" />
        </q-item-section>
        <q-item-section side >
          <q-btn flat icon="delete" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-separator spaced />
    <q-btn color="primary" label="Export all public keys" />
    <q-btn color="primary" label="Import key" />
    <q-btn color="primary" label="Generate new key" @click="openGenerateNewKey" />

    <q-dialog v-model="generateNewKeyDialog" persistent>
      <q-card>
        <q-card-section class="row items-center q-pa-md">
          <q-list>
            <q-item>
              <q-item-label header>Generate new key</q-item-label>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Email</q-item-label>
              </q-item-section>
              <q-item-section side >
                <q-item-label>{{ newKeyEmail }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Password</q-item-label>
              </q-item-section>
              <q-item-section side >
                <q-input type="password" v-model="newKeyPassword" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Key length</q-item-label>
              </q-item-section>
              <q-item-section side >
                <q-item-label>{{ newKeyLength }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Generate" color="primary" @click="generateNewKey" v-close-popup />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>

</template>

<style></style>

<script>
export default {
  name: 'OpenPgpSettings',

  components: {
  },

  data () {
    return {
      enableOpenPgp: false,
      generateNewKeyDialog: false,
      newKeyPassword: '',
      newKeyLength: 2048,
    }
  },

  computed: {
    newKeyEmail () {
      return this.$store.getters['mail/getCurrentAccountEmail']
    },
  },

  methods: {
    openGenerateNewKey () {
      this.generateNewKeyDialog = true
    },
    generateNewKey () {

    },
  },
}
</script>
