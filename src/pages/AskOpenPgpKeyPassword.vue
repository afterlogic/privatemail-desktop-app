<template>
  <q-dialog v-model="enterOpenPgpKeyPassword" persistent>
    <q-card class="q-dialog-size">
      <q-card-section>
        <div class="text-h6">Enter password</div>
      </q-card-section>
      <q-card-section>
        <span>Enter password for {{ openPgpKeyFullEmail }} OpenPGP key</span>
      </q-card-section>
      <q-item>
        <q-item-section side>
          <q-item-label>OpenPGP key password</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-input type="password" outlined dense v-model="openPgpKeyPassword" @keyup.enter="setOpenPgpKeyPassword" ref="openPgpPassword" />
        </q-item-section>
      </q-item>
      <q-card-actions align="right">
        <q-btn flat label="Ok" color="primary" @click="setOpenPgpKeyPassword" />
        <q-btn flat label="Cancel" color="grey-6" @click="cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'AskOpenPgpKeyPassword',

  data () {
    return {
      enterOpenPgpKeyPassword: false,
      openPgpKeyFullEmail: '',
      openPgpKeyPassword: '',
      openPgpKeyCallback: null,
    }
  },

  methods: {
    askOpenPgpKeyPassword: async function (sFullEmail, fCallback) {
      this.enterOpenPgpKeyPassword = true
      this.openPgpKeyFullEmail = sFullEmail
      this.openPgpKeyPassword = ''
      this.openPgpKeyCallback = fCallback || null

      await this.$nextTick()
      this.$refs.openPgpPassword.$el.focus()
    },
    setOpenPgpKeyPassword () {
      if (_.isFunction(this.openPgpKeyCallback)) {
        this.openPgpKeyCallback(this.openPgpKeyPassword)
      }
      this.enterOpenPgpKeyPassword = false
    },
    cancel () {
      this.enterOpenPgpKeyPassword = false
      this.openPgpKeyCallback(null)
    }
  },
}
</script>
