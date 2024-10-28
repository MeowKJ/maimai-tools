<template>
    <v-container>
        <h1>分数线计算器</h1>
        <p>在 Maimai 游戏中，你可以通过这个计算器来计算你的分数线。</p>
        <v-divider></v-divider>
        <v-row>
            <!-- 步骤一 -->
            <v-col cols="12">
                <h2>步骤一：选取你要计算的乐曲</h2>
                <v-row>
                    <v-col cols="8">
                        <v-text-field label="输入别名或 ID" v-model="alias" outlined placeholder="输入别名或 ID" />
                    </v-col>
                    <v-col cols="4">
                        <v-btn color="primary" @click="findSong" style="height: 56px;">查找歌曲</v-btn>
                    </v-col>
                </v-row>
                <div v-if="results.length > 0">
                    <h3>找到的歌曲：</h3>
                    <v-row>
                        <v-col v-for="song in results" :key="song.SongID" cols="12" md="6" lg="6">
                            <v-card @click="selectSong(song)" style="cursor: pointer;">
                                <v-row no-gutters>
                                    <v-col cols="4">
                                        <v-img :src="getSongImage(song.SongID)" />
                                    </v-col>
                                    <v-col cols="8">
                                        <v-card-title>{{ song.title }}</v-card-title>
                                        <v-card-subtitle>艺术家: {{ song.artist }}</v-card-subtitle>
                                        <v-card-subtitle>分类: {{ song.genre }}</v-card-subtitle>
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>
                <p v-else-if="errorMessage">{{ errorMessage }}</p>
            </v-col>

            <v-divider></v-divider>

            <!-- 步骤二 -->
            <v-col v-if="selectedSong" cols="12">
                <h2>步骤二：选择铺面</h2>
                <p class="mt-2 mb-2">
                    {{ selectedSong.title }}
                    [ ID: {{ isSelectedDXType ? selectedSong.SongID + 10000 : selectedSong.SongID }} ]</p>

                <!-- 选择铺面 -->
                <v-row>
                    <v-col cols="12">
                        <v-btn @click="isSelectedDXType = !isSelectedDXType" color="primary" style="width: 100%;"
                            :disabled="!hasTwoTypes">
                            {{ isSelectedDXType ? 'DX 铺面' : '标准铺面' }}
                        </v-btn>
                    </v-col>
                </v-row>

                <!--选择难度-->

                <v-row>
                    <v-col v-for="(diff, index) in selectedDiffList" :key="index" :cols="index === 4 ? 12 : 6" md="2">
                        <v-btn @click="selectLevelIndex(index)" :color="diffString[index].color"
                            :disabled="selectedLevelIndex === index" style="width: 100%;">
                            {{ diffString[index].name }} {{ diff.level_value }}

                        </v-btn>
                    </v-col>
                </v-row>

                <!--显示铺面信息-->
                <v-card class="mx-auto">
                    <v-card-title>{{ selectedSong?.title || '选择一首乐曲' }}</v-card-title>
                    <v-card-subtitle>{{ selectedSong?.artist || '艺术家信息' }}</v-card-subtitle>

                    <template v-slot:append>
                        <!-- 显示当前选择的难度等级 -->
                        <v-chip v-if="selectedSong" :color="diffString[selectedLevelIndex].color" variant="flat">
                            {{ selectedDiffList[selectedLevelIndex]?.level_value || '无' }}
                        </v-chip>
                        <v-chip v-if="selectedSong">
                            {{ isSelectedDXType ? 'DX' : '标准' }}
                        </v-chip>
                    </template>

                    <template v-slot:prepend>
                        <v-avatar size="48">
                            <v-img :src="getSongImage(selectedSong?.SongID || 0)"></v-img>
                        </v-avatar>
                    </template>

                    <v-card-text>
                        {{ selectedSong ? '点击不同的难度等级以查看分数线信息。' : '请选择一首乐曲以查看详细信息。' }}
                    </v-card-text>
                </v-card>

            </v-col>
        </v-row>
    </v-container>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { fetchSongDetails, Song } from '@/plugins/song'

const maimaiAliasUrl = 'https://api.yuzuchan.moe/maimaidx/maimaidxalias'
const alias = ref('')
const results = ref<Song[]>([])
const errorMessage = ref<string | null>(null)
const selectedSong = ref<Song | null>(null)
const maimaiAlias = ref<any[]>([])

const hasTwoTypes = ref(false)
const isSelectedDXType = ref(true)
const selectedLevelIndex = ref(0)

const diffString = [
    { level: 1, name: 'Basic', color: 'green' },
    { level: 2, name: 'Advance', color: 'yellow' },
    { level: 3, name: 'Expert', color: 'red' },
    { level: 4, name: 'Master', color: 'purple' },
    { level: 5, name: 'Remaster', color: 'purple-lighten-4' },
]

// 计算选择的铺面列表
const selectedDiffList = computed(() => {
    return selectedSong.value
        ? isSelectedDXType.value
            ? selectedSong.value.difficulties.dx
            : selectedSong.value.difficulties.standard
        : []
})

// 获取别名列表
async function fetchAliases() {
    try {
        const response = await fetch(maimaiAliasUrl)
        const data = await response.json()
        maimaiAlias.value = data.content  // 使用 maimaiAlias 保存数据内容
    } catch (error) {
        console.error('Failed to fetch aliases:', error)
    }
}
fetchAliases()

// 查找歌曲
async function findSong() {
    errorMessage.value = null
    results.value = []

    const trimmedAlias = alias.value.trim()
    if (!trimmedAlias) {
        errorMessage.value = '请输入别名或 ID。'
        return
    }

    const id = Number(trimmedAlias)
    const isNumericInput = !isNaN(id)

    // 过滤歌曲，若为数字，则查找匹配的ID；否则，按别名查找
    results.value = filterUniqueSongs(
        maimaiAlias.value.filter(
            song => song.SongID === (isNumericInput ? id : -1) || song.Alias.includes(trimmedAlias)
        )
    )

    if (results.value.length === 0) {
        errorMessage.value = '未找到对应的歌曲。'
        return
    }

    // 获取歌曲详细信息
    results.value = await Promise.all(results.value.map(song => fetchSongDetails(song.SongID)))
}

// 选择歌曲
function selectSong(song: Song) {
    selectedSong.value = song

    if (song.difficulties.dx.length === 0) {
        isSelectedDXType.value = false
    } else {
        isSelectedDXType.value = true
    }

    if (song.difficulties.standard.length !== 0 && song.difficulties.dx.length !== 0) {
        hasTwoTypes.value = true
    } else {
        hasTwoTypes.value = false
    }


}

// 选择铺面
function selectLevelIndex(index: number) {
    selectedLevelIndex.value = index
}

// 工具方法：获取歌曲图片URL
function getSongImage(songID: number) {
    return `https://maimai.mpas.top/assets/cover/${songID}`
}

// 去除重复的歌曲ID
function filterUniqueSongs(songs: any[]) {
    const uniqueSongs = songs.map(song => {
        if (song.SongID > 10000) song.SongID %= 10000
        return song
    })
    return uniqueSongs.filter(
        (song, index, self) => index === self.findIndex(t => t.SongID === song.SongID)
    )
}
</script>
