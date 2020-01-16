<template>
  <div>
    <div class="text-h4 q-mb-md">Contacts</div>
    <q-separator spaced />
    <q-list style="max-width: 500px;">
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
    <q-btn color="primary" label="Save" align="right" />
  </div>

</template>

<style></style>

<script>
export default {
  name: 'ContactsSettings',

  data () {
    return {
      perPageValue: 20,
      perPageList: [10,20,30,50,100,200],
    }
  },
}
</script>
