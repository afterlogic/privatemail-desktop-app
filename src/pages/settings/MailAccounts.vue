<template>
  <div>
    <div class="text-h4 q-mb-md non-selectable">Email accounts settings</div>
    <q-separator spaced />
    <q-list class="non-selectable">
      <q-item v-ripple clickable
        :class="{checked: iEditAccountId === oAccount.iAccountId}"
        v-for="oAccount in accounts" :key="oAccount.iAccountId"
        @click="changeEditAccount(oAccount.iAccountId)"
      >
        <q-item-section>
          <q-item-label>{{ oAccount.sEmail }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat color="primary" label="add identity" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-separator spaced />
    <q-tabs
      v-model="mailTab"
      inline-label
      :no-caps=true
      align="left"
      class="flex-start"
    >
      <q-tab name="props" label="Properties" />
      <!-- <q-tab name="folders" label="Folders" />
      <q-tab name="forward" label="Forward" />
      <q-tab name="autoresponder" label="Autoresponder" />
      <q-tab name="filters" label="Filters" /> -->
    </q-tabs>
    <q-separator />

    <q-tab-panels
      v-model="mailTab"
      animated
      transition-prev="jump-up"
      transition-next="jump-up"
    >
      <q-tab-panel name="props" class="bg-grey-1">
        <q-list class="non-selectable">
          <q-item tag="label" v-ripple>
            <q-item-section side top>
              <q-checkbox v-model="bUseThreading" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Use mail threading if supported by the server</q-item-label>
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section side top>
              <q-checkbox v-model="bSaveRepliesToCurrFolder" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Save replies to the current folder</q-item-label>
              <q-item-label caption>
                When enabled, threads will include your replies and thus will look more complete.
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>
                <q-btn unelevated outline color="warning" label="Remove account" />
              </q-item-label>
              <q-item-label caption>
                Removes this account from the list. It won't delete the actual account from the mail server.
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-separator spaced />
        <div class="q-pa-md">
          <q-btn unelevated color="primary" label="Save" />
        </div>
      </q-tab-panel>

      <!-- <q-tab-panel name="folders">
        <q-list padding>
          <q-item-label header>User Controls</q-item-label>

          <q-item clickable v-ripple>
            <q-item-section>
              <q-item-label>Content filtering</q-item-label>
              <q-item-label caption>
                Set the content filtering level to restrict
                apps that can be downloaded
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section>
              <q-item-label>Password</q-item-label>
              <q-item-label caption>
                Require password for purchase or use
                password to restrict purchase
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <q-tab-panel name="forward">
        <div class="q-pa-md">
          <q-item tag="label">
            <q-item-section side top>
              <q-checkbox v-model="enableForward" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Enable forward</q-item-label>
            </q-item-section>
          </q-item>
          <div class="row">
            <div class="col-2">
              <q-item-label>Email</q-item-label>
            </div>
            <div class="col">
              <q-input outlined rounded v-model="forwardEmail" :dense=true style="width: 100%;">
                <template v-slot:prepend>
                  <q-icon name="search" ></q-icon>
                </template>
                <template v-slot:after>
                  <q-btn round dense flat icon="send" ></q-btn>
                </template>
              </q-input>
            </div>
          </div>
        </div>
        <q-separator spaced />
        <q-btn color="primary" label="Save" />
      </q-tab-panel>
      
      <q-tab-panel name="autoresponder" class="autoresponder">
        <div class="q-pa-md">
          <q-item tag="label">
            <q-item-section side top>
              <q-checkbox v-model="enableAutoresponder" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Enable autoresponder</q-item-label>
            </q-item-section>
          </q-item>
          <div class="row">
            <div class="col-2">
              <q-item-label>Subject</q-item-label>
            </div>
            <div class="col">
              <q-input outlined rounded v-model="autoresponderSubject" :dense=true style="width: 100%;">
                <template v-slot:prepend>
                  <q-icon name="search" ></q-icon>
                </template>
                <template v-slot:after>
                  <q-btn round dense flat icon="send" ></q-btn>
                </template>
              </q-input>
            </div>
          </div>

          <div class="row">
            <div class="col-2">
              <q-item-label>Message</q-item-label>
            </div>
            <div class="col">
              <q-editor
                v-model="autoresponderMessage"
                :definitions="{
                  bold: {label: 'Bold', icon: null, tip: 'My bold tooltip'}
                }"
              />
            </div>
          </div>
        </div>
        <q-separator spaced />
        <q-btn color="primary" label="Save" />
      </q-tab-panel>
      <q-tab-panel name="filters">
        <q-item-label header>Filters</q-item-label>
      </q-tab-panel> -->
    </q-tab-panels>
  </div>
</template>

<style lang="scss" scoped>
.autoresponder .row + .row {
  margin-top: 1rem;
}
</style>

<script>

export default {
  name: 'MailAccounts',

  data () {
    return {
      mailTab: 'props',

      iEditAccountId: 0,

      // enableAutoresponder: false,
      // autoresponderSubject: '',
      // autoresponderMessage: '',
      // enableForward: '',
      // forwardEmail: '',

      bUseThreading: false,
      bSaveRepliesToCurrFolder: false,
    }
  },

  computed: {
    accounts () {
      return this.$store.getters['mail/getAccounts']
    },
    editAccount () {
      console.log('editAccount', this.iEditAccountId)
      return _.find(this.accounts, (oAccount) => {
        return oAccount.iAccountId === this.iEditAccountId
      })
    },
  },

  watch: {
    editAccount () {
      if (this.editAccount) {
        this.bUseThreading = this.editAccount.bUseThreading
        this.bSaveRepliesToCurrFolder = this.editAccount.bSaveRepliesToCurrFolder
      }
    },
  },

  mounted () {
    if (this.iEditAccountId === 0 && this.accounts.length > 0) {
      this.iEditAccountId = this.accounts[0].iAccountId
    }
  },

  methods: {
    changeEditAccount (iAccountId) {
      console.log('changeEditAccount', iAccountId)
      this.iEditAccountId = iAccountId
    },
  },
}
</script>
