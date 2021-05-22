<template>
  <div class="test">
    <q-list class="folder-list">
      <FolderListItem v-for="folder in foldersTree" :key="folder.Hash" :folder="folder" :currentFolderFullName="currentFolderFullName"></FolderListItem>
    </q-list>
    <div class="progress-bar">
      <div id="myProgress" @click="move">
        <div id="myBar"></div>
      </div>
      <br>
    </div>
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
    move() {
      let elem = document.getElementById("myBar");
      let width = 1;
      let id = setInterval(frame, 10);
      function frame() {
        if (width >= 100) {
          clearInterval(id);
        } else {
          width++;
          elem.style.width = width + '%';
        }
      }
    }
  },
}
</script>
<style scoped>
.progress-bar {
  display: flex;
  align-items: center;
}
#myProgress {
  margin: auto;
  height: 10px;
  width: 60%;
  background-color: transparent;
  padding: 2px 4px 2px 4px;
  border: 1px solid #7922CC;
  border-radius: 15px;
}

#myBar {
  overflow:hidden;

  width: 0;
  height: 4px;
  background-color: #BC4799;
}
</style>
