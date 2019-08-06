<template>
  <q-list>
    <q-item clickable v-ripple>
      <!-- <q-item-section avatar>
        <q-icon name="person" />
      </q-item-section> -->
      <q-item-section>Personal</q-item-section>
    </q-item>

    <q-item clickable v-ripple>
      <!-- <q-item-section avatar>
        <q-icon name="group" />
      </q-item-section> -->
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

<style></style>

<script>
import {groups} from "../../contactsData.js"

export default {
  name: "GroupList",
  data () {
    return {
      groupsList: []
    }
  },
  mounted: function () {
    this.groupsList = groups;
  }
};
</script>
