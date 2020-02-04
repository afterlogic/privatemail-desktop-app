<template>
  <div>
    <div class="text-h4 q-mb-md">Files settings</div>
    <q-separator spaced />
    <q-list>
      <q-item-label header>Files Table view</q-item-label>

      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="check1" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Enable Table view for files list</q-item-label>
          <q-item-label caption>
            Some feature description
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="check2" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Enable Preview pane</q-item-label>
          <q-item-label caption>
            Some feature description
          </q-item-label>
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
  name: "MailSettings",
  components: {
  },
  data () {
    return {
      check1: false,
      check2: true,
    }
  }
};
</script>
