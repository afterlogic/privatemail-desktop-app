<template>
  <q-list class="folder-list">
    <FolderListItem v-for="folder in foldersTree" :key="folder.Hash" :folder="folder" :currentFolderFullName="currentFolderFullName"></FolderListItem>
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
import FolderListItem from './FolderListItem.vue'

export default {
  name: 'FolderList',
  components: {
    FolderListItem,
  },
  computed: {
    foldersTree () {
      return this.$store.getters['mail/getCurrentFoldersTree']
    },
    currentFolderFullName () {
      return this.$store.getters['mail/getCurrentFolderFullName']
    },
  },
  methods: {
    selectFolder (folderFullName) {
      this.$store.dispatch('mail/setCurrentFolder', folderFullName)
    },
  },
}
</script>
