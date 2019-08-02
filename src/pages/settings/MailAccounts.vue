<template>
  <div>
    <div class="text-h4 q-mb-md">Email accounts settings</div>
    <q-separator spaced />
    <q-tabs
      v-model="mailTab"
      inline-label
      :no-caps=true
      align="left"
      class="flex-start"
    >
      <q-tab name="props" label="Mails" />
      <q-tab name="folders" label="Folders" />
      <q-tab name="forward" label="Forward" />
      <q-tab name="autoresponder" label="Autoresponder" />
      <q-tab name="filters" label="Filters" />
    </q-tabs>
    <q-separator />

    <q-tab-panels
      v-model="mailTab"
      animated
      transition-prev="jump-up"
      transition-next="jump-up"
    >
      <q-tab-panel name="props">
        <q-list>
          <q-item-label header>General</q-item-label>

          <q-item tag="label" v-ripple>
            <q-item-section side top>
              <q-checkbox v-model="check1" />
            </q-item-section>

            <q-item-section>
              <q-item-label>Notifications</q-item-label>
              <q-item-label caption>
                Notify me about updates to apps or games that I downloaded
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section side top>
              <q-checkbox v-model="check2" />
            </q-item-section>

            <q-item-section>
              <q-item-label>Sound</q-item-label>
              <q-item-label caption>
                Auto-update apps at anytime. Data charges may apply
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section side top>
              <q-checkbox v-model="check3" />
            </q-item-section>

            <q-item-section>
              <q-item-label>Auto-add widgets</q-item-label>
              <q-item-label caption>
                Automatically add home screen widgets
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator spaced />
          <q-item-label header>Notifications</q-item-label>

          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>Battery too low</q-item-label>
            </q-item-section>
            <q-item-section side >
              <q-toggle color="blue" v-model="notif1" val="battery" />
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>Friend request</q-item-label>
              <q-item-label caption>Allow notification</q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-toggle color="green" v-model="notif2" val="friend" />
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>Picture uploaded</q-item-label>
              <q-item-label caption>Allow notification when uploading images</q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-toggle color="red" v-model="notif3" val="picture" />
            </q-item-section>
          </q-item>
        </q-list>
        <q-separator spaced />
        <q-btn color="primary" icon="done" label="Save" align="right" />
      </q-tab-panel>

      <q-tab-panel name="folders">
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
        <q-item-label header>Forward</q-item-label>
      </q-tab-panel>
      <q-tab-panel name="autoresponder">
        <q-item-label header>Autoresponder</q-item-label>
      </q-tab-panel>
      <q-tab-panel name="filters">
        <q-item-label header>Filters</q-item-label>
      </q-tab-panel>

    </q-tab-panels>
  </div>
</template>

<style></style>

<script>
// import CommonTab from "pages/settings/Common.vue"

export default {
  name: "MailAccounts",
  components: {
    // CommonTab
  },
  data () {
    return {
      tab: 'mails',
      mailTab: 'props',
      splitterModel: 20,
      check1: false,
      check2: true,
      check3: false,
      notif1: false,
      notif2: true,
      notif3: true
    }
  }
};
</script>
