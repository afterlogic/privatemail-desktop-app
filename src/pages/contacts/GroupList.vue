<template>
  <q-list>
    <q-item v-for="storage in storageList" :key="storage.name"
      clickable
      v-ripple
      :class="{active: currentGroupUUID === '' && storage.name === currentStorage}"
      @click="setCurrentStorage(storage.name)"
    >
      <q-item-section>{{ storage.text }}</q-item-section>
    </q-item>

    <q-separator />
    <q-item-label header v-if="groupList.length > 0">Groups</q-item-label>

    <q-item clickable v-ripple v-for="group in groupList" :key="group.UUID"
      :class="{active: group.UUID === currentGroupUUID}"
      @click="setCurrentGroup(group)"
    >
      <!-- <q-item-section avatar>
        <q-icon name="folder" />
      </q-item-section> -->
      <q-item-section>
        <q-item-label lines="1"><span style="font-size: 18px;">#&nbsp;&nbsp;</span>{{group.Name}}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<style lang="scss" scoped>
.active {
  background: var(--q-color-t-selection);
}
</style>

<script>
export default {
  name: 'GroupList',

  computed: {
    'storageList': function () {
      return this.$store.getters['contacts/getStorageList']
    },
    'currentStorage': function () {
      return this.$store.getters['contacts/getCurrentStorage']
    },
    'currentGroupUUID': function () {
      return this.$store.getters['contacts/getCurrentGroupUUID']
    },
    'groupList': function() {
      return this.$store.getters['contacts/getGroups']
    },
  },

  mounted: function() {
    this.$store.dispatch('contacts/asyncGetStorages')
    this.$store.dispatch('contacts/asyncGetGroups')
  },

  methods: {
    setCurrentStorage (sStorage) {
      this.$store.commit('contacts/setCurrentStorage', sStorage)
      this.$store.commit('contacts/setCurrentGroup', null)
    },
    setCurrentGroup (oGroup) {
      this.$store.dispatch('contacts/setCurrentContactByUUID', null)
      this.$store.commit('contacts/setCurrentGroup', oGroup)
    },
  },
}
</script>
