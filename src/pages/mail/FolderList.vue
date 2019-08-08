<template>
  <q-list class="folder-list">
    <q-item clickable v-ripple :class="{active: currentItem === 'inbox'}" @click="setActiveItem('inbox')">
      <q-item-section avatar>
        <q-icon name="mail" />
      </q-item-section>
      <q-item-section>Inbox</q-item-section>
      <q-item-section side>
        <q-chip dense>3</q-chip>
      </q-item-section>
    </q-item>
    <q-item clickable v-ripple :class="{active: currentItem === 'star'}" @click="setActiveItem('star')">
      <q-item-section avatar>
        <q-icon name="star" />
      </q-item-section>
      <q-item-section>Starred</q-item-section>
      <q-item-section side>
        <q-chip dense>2</q-chip>
      </q-item-section>
    </q-item>
    <q-item clickable v-ripple :class="{active: currentItem === 'send'}" @click="setActiveItem('send')">
      <q-item-section avatar>
        <q-icon name="send" />
      </q-item-section>
      <q-item-section>Sent</q-item-section>
      <q-item-section side>
        <q-chip dense>10</q-chip>
      </q-item-section>
    </q-item>

    <q-expansion-item 
    
      icon="mail"
      label="Inbox"
      default-opened
      switch-toggle-side
    >
      <q-item clickable v-ripple>
        <q-space :class="'offset-1x'" />
        <!-- <q-item-section avatar>
          <q-icon name="mail" />
        </q-item-section> -->
        <q-item-section>Some folder</q-item-section>
        <q-item-section side>
          <q-chip dense>1</q-chip>
        </q-item-section>
      </q-item>

      <q-expansion-item icon="receipt" label="Receipts" default-opened switch-toggle-side :header-inset-level="0.5">
        <q-item clickable v-ripple>
          <q-space :class="'offset-2x'" />
          <!-- <q-item-section avatar>
            <q-icon name="mail" />
          </q-item-section> -->
          <q-item-section>Some folder</q-item-section>
          <q-item-section side>
            <q-btn label=1 rounded dense color="secondary" />
          </q-item-section>
        </q-item>

        <q-expansion-item icon="receipt" label="Receipts" default-opened switch-toggle-side :header-inset-level="1">
          <q-item clickable v-ripple>
            <q-space :class="'offset-3x'" />
            <q-item-section>Some folder</q-item-section>
            <q-item-section side>1</q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-space :class="'offset-3x'" />
            <q-item-section>Some folder</q-item-section>
            <q-item-section side>
              <q-chip dense>2356789</q-chip>
            </q-item-section>
          </q-item>
        </q-expansion-item>

      </q-expansion-item>
    </q-expansion-item>
  </q-list>
</template>

<style lang="scss">
.active {
  background: var(--q-color-t-selection);
}
.folder-list {
  .q-chip {
    min-width: 2em;
    justify-content: center;
    background: var(--q-color-primary);
    color: #fff;
  }
  .q-item__section--avatar {
    min-width: 40px;
  }
  .offset-1x {
    width: 28px + 14px;
  }
  .offset-2x {
    width: 56px + 14px;
  }
  .offset-3x {
    width: 84px + 14px;
  }
  
}
</style>

<script>
export default {
  name: "FolderList",
  data () {
    return {
      currentItem: 'inbox',
    }
  },
  methods: {
    setActiveItem (v) {
      this.currentItem = v;
    }
  }
};
</script>
