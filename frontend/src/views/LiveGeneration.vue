<script setup lang="ts">
import { useLiveGenerationRequest } from './LiveGeneration/composables';
import RequestLoader from '@/components/RequestLoader.vue';

const liveGenerationRequest = useLiveGenerationRequest(true);
</script>

<template>
  <div class="live-generation-1">
    <h2>Live Generation 1</h2>
    <RequestLoader :request="liveGenerationRequest">
      <p>{{ liveGenerationRequest.data }}</p>
    </RequestLoader>
  </div>
  <div class="live-generation-2">
    <h2>Live Generation 2</h2>
  </div>
</template>

<style>
.live-generation-1 {
  grid-row: 2;
  grid-column: 1 / 3;
}

.live-generation-2 {
  grid-row: 2;
  grid-column: 3 / 6;
}

@media (min-width: 1024px) {
  .live-generation {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
