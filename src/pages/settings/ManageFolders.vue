<template>
<div>
  <q-item  clickable v-ripple style="height: 50px">
    <q-item-section avatar>
      <q-icon v-if="folder.IconName" :name="folder.IconName" style="margin: auto"/>
      <q-icon v-else :name="'panorama_fish_eye'" size="8px" style="margin: auto"/>
    </q-item-section>
    <q-item-section>
      <q-item-label>{{folder.Name}}</q-item-label>
    </q-item-section>
    <q-item-section>
      <q-toolbar style="margin-left: auto; width: auto;">
        <span>{{ folder.Count }}</span>
        <q-btn :disable="folder.SubFolders.length > 0" flat no-wrap color="primary" icon="visibility"/>
        <q-btn :disable="folder.SubFolders.length > 0 || folder.Count > 0" flat no-wrap color="primary"
               icon="delete_outline"/>
      </q-toolbar>
    </q-item-section>
  </q-item>
  <template v-if="folder.SubFolders">
    <ManageFolders v-for="subfolder in folder.SubFolders" :key="subfolder.Hash" :folder="subfolder" :level="folder.Namespaced ? level : level + 1" :currentFolderFullName="currentFolderFullName"></ManageFolders>
  </template>
</div>
</template>

<script>
import ManageFolders  from './ManageFolders'
export default {
  name: "ManageFolders",
  components: {
    ManageFolders
  },
  props: {
    folder: Object,
    currentFolderFullName: String,
    level: {
      type: Number,
      default: 0,
    },
  },
  mounted() {
    console.log(this.folder)
  }
}
</script>

<style scoped>

</style>
