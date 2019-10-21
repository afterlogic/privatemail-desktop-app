<template>
  <q-toolbar>
    <q-btn flat color="primary" icon="group_add" />
    <q-btn flat color="primary" icon="mail_outline" />
    <q-btn-dropdown flat color="primary" icon="folder_open">
      <q-list>
        <q-item clickable v-ripple v-for="group in groupsList" :key="group.id">
          <q-item-section>{{group.name}}</q-item-section>
        </q-item>
        <q-item clickable v-ripple>
          <q-item-section>- New group -</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <q-btn flat color="primary" icon="delete_outline" />
    <q-btn-dropdown flat color="primary" icon="import_export">
      <q-list>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Export as CSV</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Export as VCF</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Import</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <q-space/>
    <q-btn flat color="primary" icon="sync" />
    <!-- <q-btn flat color="primary" label="Flat" /> -->
  </q-toolbar>
</template>

<style></style>

<script>
import { groups } from '../../contactsData.js'

export default {
  name: 'MailListToolbar',
  components: {
  },
  data () {
    return {
      groupsList: []
    }
  },
  mounted: function () {
    this.groupsList = groups
  },
  methods: {
  },
}
</script>
