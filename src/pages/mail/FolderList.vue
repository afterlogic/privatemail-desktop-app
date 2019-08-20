<template>
  <q-list class="folder-list">
    <FolderListItem v-for="folder in folderList" :key="folder.Hash" :folder="folder" :currentItem="currentItem"></FolderListItem>
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
  data () {
    return {
      currentItem: 'INBOX',
    }
  },
  computed: {
    folderList () {
      return this.$store.getters['mail/getFolderList']
    },
  },
  methods: {
    setActiveItem (folderFullName) {
      this.currentItem = folderFullName
    },
  },
}
</script>
