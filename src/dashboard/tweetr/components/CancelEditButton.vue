<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { CountdownTimer } from '@tweetr/types/schemas';

export default defineComponent({
  emits: ['editClicked', 'cancelClicked'],
  props: {
    countdownTimer: {
      type: Object as PropType<CountdownTimer>,
      required: true,
    },
  },
});
</script>

<template>
  <v-btn color="error" @click="$emit('cancelClicked')" v-if="countdownTimer.countdownActive">
    Cancel
  </v-btn>
  <v-btn v-else @click="$emit('editClicked')" :disabled="countdownTimer.sendTweet">Edit</v-btn>
</template>
