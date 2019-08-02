<template>
  <q-scroll-area style="height: 100%;">
    <q-list>
      <q-item clickable v-ripple>
        <!-- <q-item-section avatar>
          <q-icon name="mail" />
        </q-item-section> -->
        <q-item-section>Personal</q-item-section>
      </q-item>

      <q-item clickable v-ripple>
        <!-- <q-item-section avatar>
          <q-icon name="star" />
        </q-item-section> -->
        <q-item-section>Team</q-item-section>
      </q-item>

      <q-separator />
      <q-item-label header>Groups</q-item-label>

      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="folder" />
        </q-item-section>
        <q-item-section>My friends</q-item-section>
        <q-item-section side>1</q-item-section>
      </q-item>

    </q-list>
  </q-scroll-area>
</template>

<style></style>

<script>
export default {
  name: "FolderList",
  data () {
    return {

    }
  }
};
</script>
