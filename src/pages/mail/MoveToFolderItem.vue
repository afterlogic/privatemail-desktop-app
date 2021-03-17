<template>
  <div v-if="folder.AllowMoveTo">
    <q-item clickable v-close-popup @click="moveMessagesToFolder(folder.FullName)" :style="{ paddingLeft: level * 16 + 'px' }">
      <q-item-section>
        <q-item-label>{{folder.Name}}</q-item-label>
      </q-item-section>
    </q-item>
    <template v-if="folder.SubFolders">
      <MoveToFolderItem v-for="subfolder in folder.SubFolders" :key="subfolder.Hash" :folder="subfolder" :level="level + 1" :moveMessagesToFolder="moveMessagesToFolder"></MoveToFolderItem>
    </template>
    </div>
</template>

<style lang="scss" scoped>
</style>

<script>
import MoveToFolderItem from './MoveToFolderItem.vue'

export default {
  name: 'MoveToFolderItem',
  components: {
    MoveToFolderItem,
  },
  props: {
    folder: Object,
    level: {
      type: Number,
      default: 0,
    },
    moveMessagesToFolder: Function,
  },
  data () {
    return {
      subfolders: [],
    }
  },
}
</script>
