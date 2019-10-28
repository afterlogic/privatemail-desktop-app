<template>
  <q-list>
    <q-item v-for="storage in storageList" :key="storage.name"
      clickable
      v-ripple
      :class="{active: storage.name === currentStorage}"
      @click="setCurrentStorage(storage.name)"
    >
      <!-- <q-item-section avatar>
        <q-icon name="person" />
      </q-item-section>-->
      <q-item-section>{{ storage.text }}</q-item-section>
    </q-item>

    <q-separator />
    <q-item-label header>Groups</q-item-label>

    <q-item clickable v-ripple v-for="group in groupsList" :key="group.id">
      <q-item-section avatar>
        <q-icon name="folder" />
      </q-item-section>
      <q-item-section>{{group.name}}</q-item-section>
      <!-- <q-item-section side>1</q-item-section> -->
    </q-item>
  </q-list>
</template>

<style lang="scss" scoped>
.active {
  background: var(--q-color-t-selection);
}
</style>

<script>
import { groups } from '../../contactsData.js'

export default {
  name: 'GroupList',
  data() {
    return {
      groupsList: [],
      currentGroup: '',
    }
  },
  computed: {
    storageList() {
      return this.$store.getters['contacts/getStorageList']
    },
    currentStorage() {
      return this.$store.getters['contacts/getCurrentStorage']
    },
  },
  mounted: function() {
    this.groupsList = groups
  },
  methods: {
    setCurrentStorage (sStorage) {
      this.$store.commit('contacts/setCurrentStorage', sStorage)
    },
  },
}
</script>
