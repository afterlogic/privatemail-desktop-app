<template>
  <div>
    <q-item clickable v-ripple :class="{selected: selected, active: active}">
      <q-item-section side class="items-center">
        <q-checkbox v-model="selected" />
        <q-icon name="star_border" color="t-selection"/>
      </q-item-section>

      <q-item-section @click="active = !active">
        <q-item-label lines="1">{{from}}</q-item-label>
        <q-item-label lines="2">{{subject}}</q-item-label>
      </q-item-section>
      <q-item-section style="flex: auto;">
        1 min ago
      </q-item-section>
    </q-item>
    <q-separator :class="{selected: selected, active: active}" />
  </div>
</template>

<style lang="scss" scoped>
.selected {
  background: var(--q-color-t-selection-alt);
}
hr.selected {
  background: #d6d6a9;
}
.active {
  background: var(--q-color-t-selection);
  color: #fff;

  .q-icon {
    color: #fff;
  }
}
hr.active {
  background: #6d5d7e;
}
</style>

<script>
export default {
  name: "MessageListItem",
  props: [
    'subject',
    'from'
  ],
  data () {
    return {
      active: false,
      selected: false,
    }
  },
  mounted: function () {
  },
  methods: {
  }
};
</script>
