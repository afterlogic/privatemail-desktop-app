<template>
  <div>
    <div class="text-h4 q-mb-md">Common settings</div>
    <q-separator spaced />
    <q-list style="max-width: 500px;">
      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="checkDesktopNotifications" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Enable desktop notifications</q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section side center style="min-width: 100px;">
          Theme
        </q-item-section>
        <q-item-section>
          <q-select outlined v-model="themeValue" :options="themesList" :dense=true style="width: 100%;"/>
        </q-item-section>
      </q-item>
        
      <q-item>
        <q-item-section side center style="min-width: 100px;">
          Language
        </q-item-section>
        <q-item-section>
          <q-select outlined v-model="languageValue" :options="languagesList" :dense=true style="width: 100%;"/>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section side center style="min-width: 100px;">
          Refresh every
        </q-item-section>
        <q-item-section>
          <q-select outlined v-model="refreshIntervalValue" :options="refreshIntervalList" :dense=true style="width: 100%;" />
        </q-item-section>
      </q-item>


      <q-item>
        <q-item-section side center>
          Time format
        </q-item-section>

        <q-item-section>
          <q-btn-toggle
              v-model="timeFormatValue"
              spread
              no-caps
              rounded
              unelevated
              toggle-color="primary"
              color="white"
              text-color="primary"
              :options="[
                {label: '1PM', value: 0},
                {label: '13:00', value: 1}
              ]"
            />
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
      notif3: true,
      themeValue: '',
      themesList: [
        'Default',
        'DeepForest',
        'Funny',
      ],
      languageValue: null,
      languagesList: [
        {
          label: 'English',
          value: 'en-GB',
          description: 'English language'
        },
        {
          label: 'Русский',
          value: 'ru-RU',
          description: 'Русский язык'
        },
      ],
      refreshIntervalValue: 1,
      refreshIntervalList: [
        {
          label: '1 minute',
          value: '1'
        },
        {
          label: '5 minutes',
          value: '5'
        },
        {
          label: 'Never',
          value: '0'
        },
      ],
      timeFormatValue: 1
    }
  }
};
</script>
