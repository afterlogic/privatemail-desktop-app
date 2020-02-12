<template>
  <div>
    <q-item
        v-if="folder.IsSubscribed || folder.HasSubscribed"
        :disable="!folder.IsSelectable || !folder.Exists || !folder.IsSubscribed"
        :clickable="folder.IsSelectable && folder.Exists && folder.IsSubscribed"
        :v-ripple="folder.IsSelectable && folder.Exists && folder.IsSubscribed"
        :style="{ paddingLeft: 16 + level * 20 + 'px' }"
        :class="{active: currentFolderFullName === folder.FullName}"
        @click="selectFolder(folder.FullName)"
    >
      <q-item-section avatar>
        <q-icon :name="folder.IconName" />
      </q-item-section>
      
      <q-item-section>
        <q-item-label lines="1">{{folder.Name}}</q-item-label>
      </q-item-section>
      <q-item-section side class="non-selectable" v-if="folder.UnseenCount > 0" @click.native.stop="showUnreadMessages">
        <q-chip dense >{{folder.UnseenCount}}
          <q-tooltip>
            Show unread messages only
          </q-tooltip>
        </q-chip>
      </q-item-section>
      <q-item-section side class="non-selectable" v-if="showTotalCount">
        <q-chip color="transparent" dense>{{folder.Count}}</q-chip>
      </q-item-section>
    </q-item>
    <template v-if="folder.SubFolders">
      <FolderListItem v-for="subfolder in folder.SubFolders" :key="subfolder.Hash" :folder="subfolder" :level="folder.Namespaced ? level : level + 1" :currentFolderFullName="currentFolderFullName"></FolderListItem>
    </template>
  </div>
</template>

<style lang="scss" scoped>
</style>

<script>
import { ipcRenderer } from 'electron'

import mailEnums from 'src/modules/mail/enums.js'

import FolderListItem from './FolderListItem.vue'

export default {
  name: 'FolderListItem',
  components: {
    FolderListItem,
  },
  props: {
    folder: Object,
    currentFolderFullName: String,
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

  computed: {
    showTotalCount () {
      return this.folder.Type === mailEnums.FolderType.Drafts && this.folder.Count > 0
    },
  },

  methods: {
    selectFolder: function (folderFullName) {
      if (_.isFunction(this.$parent.selectFolder)) {
        this.$parent.selectFolder(folderFullName)
      } else if (_.isFunction(this.$parent.$parent.selectFolder)) {
        this.$parent.$parent.selectFolder(folderFullName)
      }
    },
    showUnreadMessages: function () {
      this.$store.dispatch('mail/asyncGetMessages', {
        sFolderFullName: this.folder.FullName,
        iPage: 1,
        sSearch: '',
        sFilter: 'unseen',
      })
    },
  },
}
</script>
