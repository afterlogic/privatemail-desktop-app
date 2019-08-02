<template>
  <q-scroll-area style="height: 100%;">
    <q-list>
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="mail" />
        </q-item-section>
        <q-item-section>Inbox</q-item-section>
        <q-item-section side>3</q-item-section>
      </q-item>
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="star" />
        </q-item-section>
        <q-item-section>Starred</q-item-section>
        <q-item-section side>1</q-item-section>
      </q-item>
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="send" />
        </q-item-section>
        <q-item-section>Sent</q-item-section>
        <q-item-section side>1</q-item-section>
      </q-item>

      <q-expansion-item 
        expand-separator
        icon="mail"
        label="Inbox"
        default-opened
        switch-toggle-side>
        <q-expansion-item :header-inset-level="1" expand-separator icon="receipt" label="Receipts" default-opened switch-toggle-side>
          <q-item clickable v-ripple :content-inset-level="1">
            <q-item-section avatar>
              <q-icon name="mail" />
            </q-item-section>
            <q-item-section>Some folder</q-item-section>
            <q-item-section side>1</q-item-section>
          </q-item>
        </q-expansion-item>
      </q-expansion-item>
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
