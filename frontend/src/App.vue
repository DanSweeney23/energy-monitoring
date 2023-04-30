<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="container">
    <header class="header-row">
      <h1>UK Energy grid</h1>

      <nav>
        <RouterLink to="/livegeneration">Live Generation</RouterLink>
        <RouterLink to="/historicgeneration">Historic Generation</RouterLink>
      </nav>
    </header>

    <RouterView>
    </RouterView>
  </div>
</template>

<style>
.container {
  display: grid;
  grid-template-columns: 20% 20% 20% 20% 20%;
}

.container > * {
  background-color: #333;
  color: #fff;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
}

.header-row {
  background-color: var(--blue-4);
  color: color;
  text-align: center;
  grid-column: 1 / 6;
  grid-row: 1;
  font-size: 1.2rem;
}

h1 {
  font-size: 3rem;
}

nav {
  margin-top: 15px;
}

nav a {
  color: white;
  background-color: none;
  border-radius: 10px;
  padding: 5px;
  margin: 3px;
}

nav a.router-link-active {
  background-color: white;
  color: var(--blue-4)
}
</style>
