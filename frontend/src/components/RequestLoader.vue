<script setup lang="ts">
import type { ApiRequest } from "../api/config";
import Spinner from "./Spinner.vue";

defineProps<{
  request: ApiRequest
}>()
</script>

<template>
  <div v-if="request.loading.value" class="spinner-wrapper">
    <Spinner />
  </div>
  <div v-else-if="request.error.value">
    <p>An error has occurred. Try again?</p>
    <button @click="request.doRequest()">Retry</button>
  </div>
  <div v-show="request.data.value">
    <slot></slot>
  </div>
</template>

<style>
.spinner-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>