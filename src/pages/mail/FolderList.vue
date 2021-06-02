<template>
  <div>
    <q-list class="folder-list">
      <FolderListItem v-for="folder in foldersTree" :key="folder.Hash" :folder="folder" :foldersTreeLength="foldersTree.length" :currentFolderFullName="currentFolderFullName"></FolderListItem>
    </q-list>
  </div>
</template>

<style lang="scss">
.active {
  background: var(--q-color-t-selection);
}
.folder-list {
  .q-chip {
    min-width: 2em;
    background: var(--q-color-primary);
    color: #fff;
    .q-chip__content {
      justify-content: center;
    }
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
      if (this.$store.getters['mail/getHasChanges']) {
        this.$store.commit('mail/setSelectedItem', {folder: folderFullName})
        this.$store.commit('mail/setTriggerChangesDialogue', true)
      } else {
        this.$store.dispatch('mail/setCurrentFolder', folderFullName)
      }
    },
  },
}
</script>
