<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="container">
    <header class="header-row">
      <h1>UK Energy Grid</h1>

      <nav>
        <RouterLink to="/">Live Generation</RouterLink>
        <RouterLink to="/dailygeneration">Daily Generation</RouterLink>
        <RouterLink to="/demand">Grid Demand</RouterLink>
        <RouterLink to="/carbon">Carbon Intensity</RouterLink>
      </nav>
    </header>

    <RouterView>
    </RouterView>
  </div>
</template>

<style>
.container {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(10, 1fr);
}

@media screen and (max-width: 768px) {
  .container {
    display: inherit;
  }

  .container>* {
    margin-bottom: 10px;
  }

  nav > * {
    display: block;
  }
}

.container .grid-box {
  background-color: #333;
  color: #fff;
  border-radius: 5px;
  padding: 10px;
}

.grid-box  h2 {
  text-align: center;
  border-bottom: #fff 1px solid;
}

.header-row {
  background-color: var(--blue-4);
  color: color;
  text-align: center;
  grid-column: 1 / 11;
  grid-row: 1;
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
