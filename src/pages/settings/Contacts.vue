<template>
  <div>
    <div class="text-h4 q-mb-md">Contacts</div>
    <q-separator spaced />
    <q-list>
      <q-item>
        <q-item-section side center style="min-width: 140px;">
          Contacts per page
        </q-item-section>
        <q-item-section>
          <q-select outlined v-model="perPageValue" :options="perPageList" :dense=true style="width: 100%;"/>
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
      perPageValue: 20,
      perPageList: [10,20,30,50,100,200]
    }
  }
};
</script>
