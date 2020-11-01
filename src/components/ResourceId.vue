<template>
  <span>
    <span class="text-grey">ID: {{ id }}</span>&nbsp;
    <q-icon class="cursor-pointer text-grey" name="content_copy" @click="copy" title="Copy ID" />
  </span>
</template>

<script>
import { copyToClipboard } from 'quasar'

export default {
  name: "ResourceId",

  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },

  methods: {
    copy() {
      copyToClipboard(this.id);
      this.$q.notify({
        message: "ID Copied",
        color: "positive",
        timeout: 500
      })
    }
  }
}
</script>

<style scoped>

</style>