<script setup lang="ts">
import type { ApiRequest } from "../api/config";
import Spinner from "./Spinner.vue";

defineProps<{
  request: ApiRequest
}>()
</script>

<template>
  <div v-if="request.loading.value">
    <Spinner />
  </div>
  <div v-else-if="request.error.value">
    <p>An error has occurred. Try again?</p>
    <button @click="request.doRequest()">Retry</button>
  </div>
  <div v-else-if="request.data.value">
    <slot></slot>
  </div>
</template>