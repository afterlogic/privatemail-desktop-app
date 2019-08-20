<template>
  <div>
    <q-item clickable v-ripple :style="{ paddingLeft: level * 20 + 'px' }" :class="{active: currentItem === folder.FullName}" @click="setActiveItem(folder.FullName)">
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
      <FolderListItem v-for="subfolder in folder.SubFolders" :key="subfolder.Hash" :folder="subfolder" :level="level + 1" :currentItem="currentItem"></FolderListItem>
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
    currentItem: String,
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
    setActiveItem: function (folderFullName) {
      if (_.isFunction(this.$parent.setActiveItem)) {
        this.$parent.setActiveItem(folderFullName)
      } else if (_.isFunction(this.$parent.$parent.setActiveItem)) {
        this.$parent.$parent.setActiveItem(folderFullName)
      }
    },
  },
}
</script>
