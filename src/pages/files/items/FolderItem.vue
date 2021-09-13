<template>
  <q-card
    flat
    class="q-mx-sm q-mb-md select-text-disable"
    align="center"
    style="width: 150px; height: 175px;"
  >
  <div
    class="folder file-focus"
    @click="function (oMouseEvent) { selectFile(file, oMouseEvent) }"
    @dblclick="openFolder(file)"
    @dragenter="dragEnter($event.target)"
    @dragleave="dragLeave($event.target)"
    :draggable="true"
    @drop="ondrop($event, file.FullPath, file.Type, file)"
    @dragend="dragend($event.target)"
    @dragstart="onDragStart($event, file)"
    @dragover.prevent
    @dragenter.prevent
  >
    <div class="child-elements file-focus__border" style="height: 150px; position:relative" :class="{
                'folder-selected': isChecked(file)
               }">
      <div class="image q-px-sm" style="padding-top: 28px">
        <div class="img-block">
          <span class="icon"></span>
        </div>
      </div>
      <div class="flex q-pr-xs" style="position: absolute; top: 67px; width: 100%; padding-left: 33px">
        <div class="q-mr-xs q-mb-xs file-icon" v-if="file.isShared()" @click="openShareDialog(file)">
          <share-icon style="fill: white !important;" :width="20" :height="20"/>
        </div>
        <div class="q-mr-xs q-mb-xs file-icon" v-if="file.hasLink()" @click="openLinkDialog(file)">
          <link-icon style="fill: white !important;" :width="20" :height="20"/>
        </div>
        <div v-if="!file.hasLink() && !file.isShared()" style="height: 26px"></div>
      </div>
      <q-card-section tag="span" style="padding: 0; font-size: 10pt;">
        <div>
          {{ file.getShortName() }}
        </div>
      </q-card-section>
    </div>
  </div>
  </q-card>
</template>

<script>
import _ from "lodash";

import ShareIcon from "../../../assets/icons/ShareIcon";
import LinkIcon from "../../../assets/icons/LinkIcon";

export default {
  name: "FolderItem",
  props: {
    file: Object,
    selectFile: Function,
    openFolder: Function,
    dragEnter: Function,
    dragend: Function,
    onDragStart: Function,
    isChecked: Function,
    openShareDialog: Function,
    openLinkDialog: Function,
    dragLeave: Function,
    checkedList: Array,
    ondrop: Function
  },
  components: {
    ShareIcon,
    LinkIcon,
  },
  data() {
    return {
      currentFile: null,
      elem: null
    }
  },
  methods: {
    getShortName (name) {
      if (name.length > 12) {
        return name.substr(0, 10) + '...'
      }
      return name
    },
    isShared (file) {
      const shares = file?.ExtendedProps?.Shares
      return _.isArray(shares) && shares.length
    },
    hasLink (file) {
      return file?.ExtendedProps?.PublicLink
    },
  }
}
</script>

<style scoped>
.file-focus__border:hover {
  border: 1px solid #c9c9c9 !important;
}
</style>
