<template>
  <div>
    <q-item clickable v-ripple :class="{active: checkValue }">
      <q-item-section avatar>
        <q-checkbox v-model="checkValue" />
        <q-icon name="star_border" />
      </q-item-section>

      <q-item-section>
        <q-item-label lines="1">{{from}}</q-item-label>
        <q-item-label caption lines="2">
          {{subject}}
        </q-item-label>
      </q-item-section>

      <q-item-section side top>
        1 min ago
      </q-item-section>
    </q-item>
    <q-separator :class="{'bg-accent-dark': checkValue }" />
  </div>
</template>

<style lang="scss" scoped>
.active {
  background: #BC4799;
  color: #fff;
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
      checkValue: false,
    }
  },
  mounted: function () {
  }
};
</script>
