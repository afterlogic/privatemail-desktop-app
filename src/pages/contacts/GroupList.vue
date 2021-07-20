<template>
  <q-list>
    <q-item v-for="storage in storageList" :key="storage.name"
            clickable
            v-ripple
            :class="{active: currentGroupUUID === '' && storage.name === currentStorage}"
            @click="setCurrentStorage(storage.name)"
    >
      <q-item-section avatar>
        <q-icon v-if="storage.name === 'personal'">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
            <path class="svg-icon"
                  d="m 12,6 c -3.3018639,0 -6,2.6981361 -6,6 0,3.301864 2.6981361,6 6,6 3.301864,0 6,-2.698136 6,-6 0,-3.3018639 -2.698136,-6 -6,-6 z m 0,2 c 2.220984,0 4,1.7790164 4,4 0,2.220984 -1.779016,4 -4,4 C 9.7790164,16 8,14.220984 8,12 8,9.7790164 9.7790164,8 12,8 Z"/>
          </svg>
        </q-icon>
        <q-icon v-else-if="storage.name === 'shared'">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
            <path class="svg-icon"
                  d="m 12,3 c -4.9587181,0 -9,4.0412819 -9,9 0,4.958718 4.0412819,9 9,9 4.958718,0 9,-4.041282 9,-9 0,-4.9587181 -4.041282,-9 -9,-9 z m 0,2 c 3.877838,0 7,3.1221621 7,7 0,3.877838 -3.122162,7 -7,7 C 8.1221621,19 5,15.877838 5,12 5,8.1221621 8.1221621,5 12,5 Z m 0,1 c -3.3018639,0 -6,2.6981361 -6,6 0,3.301864 2.6981361,6 6,6 3.301864,0 6,-2.698136 6,-6 0,-3.3018639 -2.698136,-6 -6,-6 z m 0,2 c 2.220984,0 4,1.7790164 4,4 0,2.220984 -1.779016,4 -4,4 C 9.7790164,16 8,14.220984 8,12 8,9.7790164 9.7790164,8 12,8 Z"/>
          </svg>
        </q-icon>
        <q-icon v-else color="white" :name="storage.IconName"/>
      </q-item-section>
      <q-item-section>
        <q-item-label lines="1">{{ storage.text }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator/>
    <q-item-label header class="non-selectable" v-if="groupList.length > 0">Groups</q-item-label>

    <q-item clickable v-ripple v-for="group in groupList" :key="group.UUID"
            :class="{active: group.UUID === currentGroupUUID}"
            @click="setCurrentGroup(group)"
    >
      <q-item-section avatar>
        <q-icon name="#"/>
      </q-item-section>
      <q-item-section>
        <q-item-label lines="1">{{ group.Name }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<style lang="scss">
.active {
  background: var(--q-color-t-selection);
}
.q-item i .svg-icon {
  fill: #fff;
}
</style>

<script>
export default {
  name: 'GroupList',

  beforeDestroy() {
    this.$store.dispatch('contacts/setCurrentContactByUUID', null)
  },
  computed: {
    currentContact () {
      return this.$store.getters['contacts/getCurrentContact']
    },
    'storageList': function () {
      let aStorageList = this.$store.getters['contacts/getStorageList'];

      aStorageList.map(function (storage) {
        let iconName = '#'
        switch (storage.name) {
          case 'all':
            iconName = "people"
            break
          case 'personal':
            // iconName = "img:statics/app-icons/contacts_personal_storage.svg"
            break
          case 'team':
            iconName = "business_center"
            break
          case 'shared':
            break
        }

        storage.IconName = iconName
        return storage
      });

      return aStorageList
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

  mounted: function () {
    this.$store.dispatch('contacts/asyncGetStorages')
    this.$store.dispatch('contacts/asyncGetGroups')
  },

  methods: {
    setCurrentStorage (sStorage) {
      this.$store.commit('contacts/setCurrentStorage', sStorage)
      this.$store.commit('contacts/setCurrentGroup', null)
      this.$store.dispatch('contacts/setCurrentContactByUUID', null)
      if (this.$route.path !== `/contacts/group/'${sStorage}/no-contact`) {
        this.$router.push(`/contacts/group/'${sStorage}/no-contact`)
      }
    },
    setCurrentGroup (oGroup) {
      this.$store.dispatch('contacts/setCurrentContactByUUID', null)
      this.$store.commit('contacts/setCurrentGroup', oGroup)
      if (this.$route.path !== `/contacts/group/'${oGroup.EntityId}/group-view`) {
        this.$router.push(`/contacts/group/'${oGroup.EntityId}/group-view`)
      }
    },
  },
}
</script>
