<template>
  <q-list>
    <q-item
      clickable
      v-ripple
      :class="{active: currentGroup === 'personal'}"
      @click="setGroup('personal')"
    >
      <!-- <q-item-section avatar>
        <q-icon name="person" />
      </q-item-section>-->
      <q-item-section>Personal</q-item-section>
    </q-item>

    <q-item clickable v-ripple :class="{active: currentGroup === 'team'}" @click="setGroup('team')">
      <!-- <q-item-section avatar>
        <q-icon name="group" />
      </q-item-section>-->
      <q-item-section>Team</q-item-section>
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
      currentGroup: 'personal',
    }
  },
  mounted: function() {
    this.groupsList = groups
  },
  methods: {
    setGroup(v) {
      this.currentGroup = v
      this.$store.dispatch('contacts/changeStorage', v)
    },
  },
}
</script>
