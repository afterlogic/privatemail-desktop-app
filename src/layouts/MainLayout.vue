<template>
  <q-layout view="hHh LpR lfr" class="theme-text main-background">
    <q-header bordered>
      <!-- <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left" />
        <q-btn dense flat round icon="menu" @click="showRight = !showRight" />
      </q-toolbar> -->
      <q-tabs align="left" class="q-pa-md main-tabs" v-if="showTabsbar">
        <q-route-tab to="/mail" :label="mailHeader" />
        <q-btn-dropdown flat color="white" class="accounts-selector" content-class="accounts-selector-dropdown">
          <q-list class="non-selectable">
            <!-- <q-item class="dummy q-mr-xl q-pr-xl_">
              {{mailHeader}}
            </q-item> -->
            <q-item clickable v-close-popup v-for="oAccount in accountsForDropdown" :key="oAccount.iAccountId" @click="changeAccount(oAccount)">
              <q-item-section>{{oAccount.sEmail}}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <!-- <q-btn-dropdown outline flat split color="white" :label="mailHeader" to="/mail" class="accounts-selector1">
          <q-item class="dummy q-mr-xl q-pr-xl_">
              {{mailHeader}}
            </q-item>
          <q-list class="non-selectable">
            <q-item clickable v-close-popup v-for="oAccount in accountsForDropdown" :key="oAccount.iAccountId" @click="changeAccount(oAccount)">
              <q-item-section>{{oAccount.sEmail}}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown> -->
        <q-route-tab to="/contacts" label="Contacts" />
        <!-- <q-route-tab to="/files" label="Files" />
        <q-route-tab to="/calendar" label="Calendar" /> -->
        <q-space />
        <q-route-tab to="/settings" label="Settings" />
        <q-route-tab to="/login" label="Log out" />
      </q-tabs>
    </q-header>
    <router-view />
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',

  mounted () {
    if (!this.isAuthorized) {
      let sCurrentPath = this.$router.currentRoute && this.$router.currentRoute.path ? this.$router.currentRoute.path : ''
      if (sCurrentPath !== '/' && sCurrentPath !== '/login') {
        this.$router.push({ path: '/' })
      }
    }
  },

  computed: {
    isAuthorized () {
      return this.$store.getters['user/isAuthorized']
    },
    mailHeader () {
      let oCurrentAccount = this.$store.getters['mail/getCurrentAccount']
      return oCurrentAccount ? oCurrentAccount.sEmail : 'Mail'
    },
    showTabsbar () {
      return this.isAuthorized // && this.mailHeader !== 'Mail'
    },
    accountsForDropdown () {
      let aAccounts = this.$store.getters['mail/getAccounts']
      let oCurrentAccount = this.$store.getters['mail/getCurrentAccount']
      let iCurrAccountId = oCurrentAccount ? oCurrentAccount.iAccountId : 0
      return _.filter(aAccounts, function (oAccount) {
        return oAccount.iAccountId !== iCurrAccountId
      })
    },
  },

  methods: {
    logIn () {
      this.$store.dispatch('login')
    },
    changeAccount (oAccount) {
      this.$store.commit('mail/setCurrentAccount', oAccount)
      this.$store.commit('mail/resetCurrentFolderList')
    },
  },
}
</script>

<style lang="scss">
  $startColor: var(--q-color-t-gradient-start);
  $endColor: var(--q-color-t-gradient-stop);
  
  .main-background {
    background: var(--q-color-t-gradient-start);
    background: -moz-linear-gradient(top, var(--q-color-t-gradient-start) 0%, var(--q-color-t-gradient-stop) 100%);
    background: -webkit-gradient(left top, left bottom, color-stop(0%, var(--q-color-t-gradient-start)), color-stop(100%, var(--q-color-t-gradient-stop)));
    background: -webkit-linear-gradient(top, var(--q-color-t-gradient-start) 0%, var(--q-color-t-gradient-stop) 100%);
    background: -o-linear-gradient(top, var(--q-color-t-gradient-start) 0%, var(--q-color-t-gradient-stop) 100%);
    background: -ms-linear-gradient(top, var(--q-color-t-gradient-start) 0%, var(--q-color-t-gradient-stop) 100%);
    background: linear-gradient(to bottom, var(--q-color-t-gradient-start) 0%, var(--q-color-t-gradient-stop) 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#410324', endColorstr='#222757', GradientType=0 );
  }

  .q-header {
    border: 0px;
  }

  .accounts-selector .q-btn-dropdown__arrow {
    margin-left: 0px;
  }
  .accounts-selector1 {
  }
  .accounts-selector-dropdown {
    margin-top: 4px;
    .dummy {
      text-transform: uppercase;
    }
  }
</style>
