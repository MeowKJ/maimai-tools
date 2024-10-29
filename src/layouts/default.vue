<template>
  <v-navigation-drawer v-model="drawer">
    <v-list-item>
      <v-list-item-media class="mt-5 mb-8">
        <v-img src="/src/assets/hammer.svg" max-height="150" />
      </v-list-item-media>
      <v-list-item-title>Maimai的小工具</v-list-item-title>
      <v-list density="compact" item-props :items="items" nav />
    </v-list-item>
  </v-navigation-drawer>

  <v-app-bar border="b" class="ps-4" flat>
    <v-app-bar-nav-icon v-if="$vuetify.display.smAndDown" @click="drawer = !drawer" />
    <v-app-bar-title>Maimai小工具</v-app-bar-title>
    <template #append>
      <v-btn icon @click="toggleTheme" title="Toggle Theme">
        <v-icon>{{ isDarkMode ? 'mdi-weather-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
      </v-btn>
    </template>
  </v-app-bar>

  <v-main>
    <div class="pa-4" style="min-height: calc(100vh - 64px - 64px);">
      <router-view />
    </div>
  </v-main>

  <app-footer />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'

const drawer = ref(true)

const items = ref([
  { title: '主页', prependIcon: 'mdi-home', to: '/' },
  { title: '分数线计算器', prependIcon: 'mdi-calculator-variant', to: '/calculator' },
])

const theme = useTheme()
const isDarkMode = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  theme.global.name.value = isDarkMode.value ? 'light' : 'dark'
}
</script>

<style scoped></style>
