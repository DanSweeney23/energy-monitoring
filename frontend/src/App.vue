<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';

const navPages = [
  { to: '/', text: 'Live Generation' },
  { to: '/dailygeneration', text: 'Daily Generation' },
  { to: '/demand', text: 'Grid Demand' },
  { to: '/carbon', text: 'Carbon Intensity' }
];
</script>

<template>
  <div class="container">
    <header class="header-row">
      <h1>UK Energy Grid</h1>
      <p>Monitoring the electricity demand, generation, and carbon emissions of the national grid</p>

      <nav class="app-navigation">
        <template v-for="(page, i) in navPages" :key="i">
          <RouterLink :to="page.to">{{ page.text }}</RouterLink>
          <span v-if="i !== navPages.length-1" class="nav-divider">|</span>
        </template>
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

  nav>* {
    display: block;
  }

  .nav-divider {
    display: none;
  }
}

.container .grid-box {
  background-color: #383838;
  color: #fff;
  border-radius: 5px;
  padding: 10px;
}

.grid-box h2 {
  text-align: center;
  border-bottom: #fff 1px solid;
}

.header-row {
  background-color: var(--blue-4);
  color: color;
  text-align: center;
  grid-column: 1 / 11;
  grid-row: 1;
  padding: 1rem;
}

h1 {
  font-size: 3rem;
  color: var(--vt-c-white-soft)
}

nav.app-navigation {
  margin-top: 15px;
}

nav.app-navigation a {
  color: white;
  background-color: none;
  border-radius: 10px;
  padding: 5px;
  margin: 3px;
}

nav.app-navigation a.router-link-active {
  background-color: white;
  color: var(--blue-4);
}</style>
