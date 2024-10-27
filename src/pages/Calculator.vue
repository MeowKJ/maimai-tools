<template>
    <v-container>
        <h1>分数线计算器</h1>
        <p>在 Maimai 游戏中，你可以通过这个计算器来计算你的分数线。</p>

        <v-divider></v-divider>

        <h2>步骤一：选取你要计算的乐曲</h2>

        <v-row>
            <v-col cols="8">
                <v-text-field label="输入别名或 ID" v-model="alias" outlined placeholder="输入别名或 ID"></v-text-field>
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
                                <v-img :src="'https://maimai.mpas.top/assets/cover/' + song.SongID"></v-img>
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
    </v-container>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { fetchSongDetails, Song } from '@/plugins/song';

// 获取别名列表
const maimaiAliasUrl = "https://api.yuzuchan.moe/maimaidx/maimaidxalias";
const maimaiAlias = ref<any[]>([]);
const alias = ref('');
const results = ref<Song[]>([]);
const errorMessage = ref<string | null>(null);
const selectedSongID = ref<number | null>(null);

// 获取别名列表
fetch(maimaiAliasUrl)
    .then(response => response.json())
    .then(data => {
        maimaiAlias.value = data.content; // 更新数据格式以匹配 API 返回
    });

// 查找歌曲
function findSong() {
    errorMessage.value = null; // 清除之前的错误信息
    results.value = []; // 清空结果
    // 去除首尾空格
    const trimmedAlias = alias.value.trim();

    if (!trimmedAlias) {
        errorMessage.value = '请输入别名或 ID。'; // 设置错误信息
        return;
    }

    // 尝试将输入值转换为数字
    const id = Number(trimmedAlias);
    const isNumericInput = !isNaN(id);

    // 同时查找 ID 和别名
    results.value = maimaiAlias.value.filter(song =>
        song.SongID === (isNumericInput ? id : -1) || song.Alias.includes(trimmedAlias)
    );

    // 如果查找到的乐曲ID大于10000，取余
    results.value = results.value.map(song => {
        if (song.SongID > 10000) {
            song.SongID = song.SongID % 10000;
        }
        return song;
    });

    // 去除重复的
    results.value = results.value.filter((song, index, self) =>
        index === self.findIndex(t => (
            t.SongID === song.SongID
        ))
    );

    if (results.value.length === 0) {
        errorMessage.value = '未找到对应的歌曲。'; // 设置错误信息
        return;
    }

    // 获取详细信息
    Promise.all(results.value.map(song => fetchSongDetails(song.SongID)))
        .then(details => {
            results.value = details;
        });
}

// 选择歌曲
function selectSong(song: Song) {
    selectedSongID.value = song.SongID;
    // 获取乐曲的详细信息
}
</script>
