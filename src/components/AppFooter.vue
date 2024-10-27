<template>
  <v-footer height="40" app>
    <a v-for="item in items" :key="item.title" :href="item.title === 'QRCode' ? undefined : item.href"
      :title="item.title" class="d-inline-block mx-2 social-link" rel="noopener noreferrer" target="_blank"
      @click.prevent="item.title === 'QRCode' ? showQRCodeDialog() : null">
      <v-icon :icon="item.icon" :size="item.title === 'QRCode' ? 24 : 16" />
    </a>

    <v-dialog v-model="dialog" width="auto">
      <v-card max-width="400" title="欢迎加入Maimai的频道" prepend-icon="mdi-qrcode-scan">
        <v-card-text>
          <img class="qrcode-img" :src="currentQRCodeUrl" alt="二维码" />
        </v-card-text>
        <template v-slot:actions>
          <v-btn class="ms-auto" text="Ok" @click="dialog = false"></v-btn>
        </template>
      </v-card>
    </v-dialog>

    <div class="text-caption text-disabled" style="position: absolute; right: 16px;">
      &copy; 2024-{{ (new Date()).getFullYear() }} <span class="d-none d-sm-inline-block">Maimai的频道</span>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify' // 引入 Vuetify 的主题

const items = [
  {
    title: 'QRCode',
    icon: 'mdi-qrcode-scan',
  },
  {
    title: 'QQ频道',
    icon: ['M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.484 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 4.078.43 6.29 0 2.239.425 6.287.687 6.287 0 0-.688-1.768-1.182-1.768-1.182 2.085-1.77 1.905-3.967 1.905-3.967.845 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.166-6.954-2.166-6.954V9.325C18.29 3.364 14.268 2 12.003 2z'],
    href: 'https://pd.qq.com/s/61jvosrk4',
  },
  {
    title: 'GitHub',
    icon: `mdi-github`,
    href: 'https://github.com/meowkj/maimai-tools',
  },
]

const dialog = ref(false)

// 引入主题
const theme = useTheme()

// 根据当前主题选择二维码 URL
const currentQRCodeUrl = computed(() => {
  return theme.global.name.value === 'dark'
    ? 'https://img.picgo.net/2024/10/26/IMG_413417308366b1735fbd.jpg' :
    'https://img.picgo.net/2024/10/26/IMG_413223d60037f4addd79.jpg' // 深色模式的 QR 码
})

function showQRCodeDialog() {
  dialog.value = true
}
</script>

<style scoped lang="sass">
  .social-link :deep(.v-icon)
    color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
    cursor: pointer
    text-decoration: none
    transition: .2s ease-in-out

    &:hover
      color: rgba(25, 118, 210, 1)

  .qrcode-img
    width: 100%
    margin-top: 16px
    height: auto
    border: 1px solid rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
    border-radius: 4px
    box-shadow: 0 0 10px rgba(0, 0, 0, .1)
</style>
