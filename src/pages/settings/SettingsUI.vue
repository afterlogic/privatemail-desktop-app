<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch" style="height: 100%">
      <q-splitter v-model="splitterModel" style="height: 100%; width: 100%;">
        <template v-slot:before>
          <q-tabs
            v-model="tab"
            vertical
            inline-label
            :no-caps=true
            align="left"
            class="flex-start"
          >
            <q-tab name="common" icon="settings" label="Common" style="justify-content: start;"/>
            <q-tab name="mail" icon="mail" label="Mail" style="justify-content: start;" />
            <q-tab name="accounts" icon="mail" label="Mail accounts" style="justify-content: start;" />
            <q-tab name="contacts" icon="contacts" label="Contacts" style="justify-content: start;" />
            <!-- <q-tab name="calendar" icon="calendar" label="Calendar" style="justify-content: start;" />
            <q-tab name="files" icon="folder" label="Files" style="justify-content: start;" />
            <q-tab name="mobile-sync" icon="sync" label="Mobile Sync" style="justify-content: start;" /> -->
            <q-tab name="open-pgp" icon="vpn_key" label="Open PGP" style="justify-content: start;" />
            <q-tab name="about" icon="" label="About" style="justify-content: start;" />
            <!-- <q-tab name="sandbox" icon="" label="SandboxTab" style="justify-content: start;" /> -->
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
            <q-tab-panel name="sandbox">
              <SandboxTab />
            </q-tab-panel>

            <q-tab-panel name="about">
              <AboutTab />
            </q-tab-panel>

            <q-tab-panel name="common">
              <common-tab />
            </q-tab-panel>
            
            <q-tab-panel name="mail">
              <mail-tab />
            </q-tab-panel>

            <q-tab-panel name="accounts">
              <mail-accounts-tab />
            </q-tab-panel>

            <q-tab-panel name="contacts">
              <contacts-tab />
            </q-tab-panel>

            <q-tab-panel name="calendar">
              <calendar-tab />
            </q-tab-panel>

            <q-tab-panel name="files">
              <files-tab />
            </q-tab-panel>

            <q-tab-panel name="mobile-sync">
              <mobile-sync-tab />
            </q-tab-panel>

            <q-tab-panel name="open-pgp">
              <OpenPGPTab />
            </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-splitter>
    </q-page>
  </q-page-container>
</template>

<style></style>

<script>


// import privateMailIcon from '~assets/app-icon.svg'

import CommonTab from "./Common.vue"
import MailTab from "./Mail.vue"
import MailAccountsTab from "./MailAccounts.vue"
import ContactsTab from "./Contacts.vue"
import CalendarTab from "./Calendar.vue"
import FilesTab from "./Files.vue"
import MobileSyncTab from "./MobileSync.vue"
import OpenPGPTab from "./OpenPgp.vue"
import AboutTab from "./About.vue"
import SandboxTab from "./Sandbox.vue"


export default {
  name: "SettingsUI",
  components: {
    CommonTab,
    MailTab,
    MailAccountsTab,
    ContactsTab,
    CalendarTab,
    FilesTab,
    MobileSyncTab,
    OpenPGPTab,
    AboutTab,
    SandboxTab,
  },
  data () {
    return {
      tab: 'common',
      mailTab: 'props',
      splitterModel: 20
    }
  }
};
</script>
