<template>
  <div class="q-gutter-md">
    <div v-for="n in 20" :key="n" class="q-my-md">
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-checkbox v-model="checkboxVal" />
          <q-icon name="star_border" />
        </q-item-section>

        <q-item-section>
          <q-item-label lines="1">Dev Team</q-item-label>
          <q-item-label caption lines="2">
            RE: Extract Cloud - Call Summary
          </q-item-label>
        </q-item-section>

        <q-item-section side top>
          1 min ago
        </q-item-section>
      </q-item>
    </div>
  </div>
</template>

<style></style>

<script>
export default {
  name: "MessageList",
  data () {
    return {
      checkboxVal: false
    }
  }
};
</script>
