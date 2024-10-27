<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <h1>欢迎来到 Maimai 的小工具</h1>
          </v-card-title>
          <v-card-text>
            <p>这里汇聚了一系列实用的小工具，帮助你更好地享受 Maimai 的游戏体验！</p>
            <v-list>
              <v-list-item v-for="tool in tools" :key="tool.title">
                <v-list-item-icon>
                  <v-icon>{{ tool.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ tool.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ tool.description }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
const tools = [
  {
    title: '分数线计算器',
    icon: 'mdi-calculator-variant',
    description: '计算你在 Maimai 游戏中的分数线。',
  },
  // 添加更多工具...
]
</script>
