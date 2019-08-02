<template>
  <div>
    <div class="text-h4 q-mb-md">Open PGP</div>
    <q-separator spaced />
    <q-list>
      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="checkDesktopNotifications" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Enable desktop notifications</q-item-label>
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
  </div>

</template>

<style></style>

<script>
// import FolderList from "components/FolderList.vue"

export default {
  name: "CommonSettings",
  components: {
  },
  data () {
    return {
      checkDesktopNotifications: false,
      check2: true,
      check3: false,
      notif1: false,
      notif2: true,
      notif3: true
    }
  }
};
</script>
