<template>
  <div>
    <q-item clickable v-ripple :style="{ paddingLeft: level * 20 + 'px' }" :class="{active: currentFolder === folder.FullName}" @click="selectFolder(folder.FullName)">
      <q-item-section avatar>
        <q-icon :name="folder.IconName" />
      </q-item-section>
      <q-item-section>{{folder.Name}}</q-item-section>
      <q-item-section side v-if="folder.UnseenCount > 0">
        <q-chip dense>{{folder.UnseenCount}}
          <q-tooltip>
            Show unread messages only
          </q-tooltip>
        </q-chip>
      </q-item-section>
      <q-item-section side v-if="folder.Type === 3 && folder.Count > 0">
        <q-chip color="transparent" dense>{{folder.Count}}</q-chip>
      </q-item-section>
    </q-item>
    <template v-if="folder.SubFolders">
      <FolderListItem v-for="subfolder in folder.SubFolders" :key="subfolder.Hash" :folder="subfolder" :level="level + 1" :currentFolder="currentFolder"></FolderListItem>
    </template>
  </div>
</template>

<style lang="scss" scoped>
</style>

<script>
import FolderListItem from './FolderListItem.vue'

export default {
  name: 'FolderListItem',
  components: {
    FolderListItem,
  },
  props: {
    folder: Object,
    currentFolder: String,
    level: {
      type: Number,
      default: 0,
    },
  },
  data () {
    return {
      subfolders: [],
    }
  },
  methods: {
    selectFolder: function (folderFullName) {
      if (_.isFunction(this.$parent.selectFolder)) {
        this.$parent.selectFolder(folderFullName)
      } else if (_.isFunction(this.$parent.$parent.selectFolder)) {
        this.$parent.$parent.selectFolder(folderFullName)
      }
    },
  },
}
</script>
