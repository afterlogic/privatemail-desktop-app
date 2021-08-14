<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch" style="height: 100%">
      <q-splitter v-model="splitterModel" style="height: 100%; width: 100%;">
        <template v-slot:before>
          <q-tabs
            vertical
            inline-label
            :no-caps=true
            align="left"
            class="flex-start"
          >
            <q-route-tab to="/settings/common" tag="q-tab" icon="settings" label="Common" style="justify-content: start;"/>
            <q-route-tab to="/settings/mail" icon="mail" label="Mail" style="justify-content: start;" />
            <q-route-tab :to="accounts.length ? '/settings/accounts/account/' + accounts[0].iAccountId + '/props' : ''" icon="mail" label="Mail accounts" style="justify-content: start;" />
            <q-route-tab to="/settings/contacts" icon="contacts" label="Contacts" style="justify-content: start;" />
            <!-- <q-tab name="calendar" icon="calendar" label="Calendar" style="justify-content: start;" />
            <q-tab name="files" icon="folder" label="Files" style="justify-content: start;" />
            <q-tab name="mobile-sync" icon="sync" label="Mobile Sync" style="justify-content: start;" /> -->
            <q-route-tab to="/settings/open-pgp"  icon="vpn_key" label="Open PGP" style="justify-content: start;" name="open-pgp"/>
            <q-route-tab to="/settings/paranoid-encryption" style="justify-content: start;" name="paranoid-encryption">
              <encrypted-icon style="fill: white" :width="25" :height="25"></encrypted-icon>
              <q-item-section class="q-ml-sm">
                Paranoid Encryption
              </q-item-section>
            </q-route-tab>
            <q-route-tab to="/settings/about" icon="error" label="About" style="justify-content: start;" name="about"/>
          </q-tabs>
        </template>

        <template v-slot:after>
            <q-tab-panels
              v-model="tab"
              _animated
              transition-prev="jump-up"
              transition-next="jump-up"
              class="panel-rounded bg-white text-grey-8"
            >
              <q-tab-panel name="static">
                <router-view></router-view>
              </q-tab-panel>
            </q-tab-panels>
        </template>
      </q-splitter>
    </q-page>
  </q-page-container>
</template>

<style></style>

<script>
import EncryptedIcon from '../../assets/icons/EncryptedIcon'

export default {
  name: "SettingsUI",
  components: {
    EncryptedIcon
  },
  data () {
    return {
      tab: 'static',
      splitterModel: 20
    }
  },
  computed: {
    accounts () {
      return this.$store.getters['mail/getAccounts']
    },
  }
};
</script>
