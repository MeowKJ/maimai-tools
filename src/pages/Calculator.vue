<template>
    <v-container>
        <h1>分数线计算器</h1>
        <p>在 Maimai 游戏中，你可以通过这个计算器来计算你的分数线。</p>
        <v-divider></v-divider>
        <v-row>
            <!-- 步骤一 -->
            <v-col class="mt-8" cols="12">
                <h2>步骤一：选取你要计算的乐曲</h2>
                <v-row class="mt-1">
                    <v-col cols="8">
                        <v-text-field label="输入别名或 ID" v-model="alias" outlined placeholder="输入别名或 ID" />
                    </v-col>
                    <v-col cols="4">
                        <v-btn color="primary" @click="findSong" style="height: 56px;">查找歌曲</v-btn>
                    </v-col>
                </v-row>
                <div v-if="results.length > 0">
                    <h3>找到的歌曲：</h3>
                    <v-row class="mt-1">
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

                <v-row class="mt-2">
                    <v-col v-for="(diff, index) in selectedDiffList" :key="index" :cols="index === 4 ? 12 : 6" md="2">
                        <v-btn @click="selectLevelIndex(index)" :color="diffString[index].color"
                            :disabled="selectedLevelIndex === index" style="width: 100%;">
                            {{ diffString[index].name }} {{ diff.level_value }}

                        </v-btn>
                    </v-col>
                </v-row>


            </v-col>

            <v-col v-if="selectedSong">
                <h2>步骤三：计算分数线</h2>
                <!--显示铺面信息-->
                <div ref="stickyDiv" class="non"></div>
                <div ref="stickyCard" class="sticky-card">
                    <v-card class="mx-auto mt-5">
                        <v-card-text>
                            <v-row no-gutters>
                                <v-col style="text-align: center;" cols="5">
                                    <span class="text-amber score-text">{{ finalScore.toFixed(4) }}</span>
                                </v-col>
                                <v-col cols="5">
                                    <v-img :src="getRateImage(finalScore)" height="28"></v-img>
                                </v-col>
                                <v-col cols="2">
                                    <v-chip :color="starNumberColor" text-color="white">{{ starNumber }}</v-chip>
                                </v-col>
                            </v-row>
                        </v-card-text>

                        <template v-slot:append>
                            <!-- 显示当前选择的难度等级 -->
                            <v-chip class="mr-2" v-if="selectedSong" :color="diffString[selectedLevelIndex].color"
                                variant="flat">
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
                            <v-card-title class="pl-2">{{ selectedSong?.title || '选择一首乐曲' }}</v-card-title>
                        </template>
                    </v-card>
                </div>


                <v-card class="mx-auto mt-5">
                    <v-card-title>音符统计</v-card-title>
                    <v-card-text>
                        <v-table>
                            <thead>
                                <tr>
                                    <th>总数</th>
                                    <th>Tap</th>
                                    <th>Hold</th>
                                    <th>Slide</th>
                                    <th>Touch</th>
                                    <th>Break</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td>{{ selectedDiffList[selectedLevelIndex]?.notes.total || 0 }}</td>
                                    <td>{{ selectedDiffList[selectedLevelIndex]?.notes.tap || 0 }}</td>
                                    <td>{{ selectedDiffList[selectedLevelIndex]?.notes.hold || 0 }}</td>
                                    <td>{{ selectedDiffList[selectedLevelIndex]?.notes.slide || 0 }}</td>
                                    <td>{{ selectedDiffList[selectedLevelIndex]?.notes.touch || 0 }}</td>
                                    <td>{{ selectedDiffList[selectedLevelIndex]?.notes.break || 0 }}</td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card-text>
                </v-card>

                <v-card class="mx-auto mt-5">
                    <v-card-title>
                        <v-row>
                            <v-col style="font-size: 1.4em;" cols="6">
                                分数线
                            </v-col>
                            <v-col cols="6" class="text-right">
                                <v-btn @click="fromCopy"> 从剪切板导入
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-title>

                    <v-card-text>
                        <v-row class="mt-3">
                            <v-col cols="12" md="6" v-for="t in basicTypeString">
                                <v-divider></v-divider>
                                <h3 class="mt-3 mb-3">{{ t.name }} - {{ notesDetails[t.type] }}</h3>
                                <v-slider v-model="criticalPrefect[t.type]" label="CPrefect" step="1"
                                    :max="notesDetails[t.type]" :color="scoreColor.criticalPrefect" thumb-label="always"
                                    readonly>
                                </v-slider>
                                <!--禁用v-slider的动画效果-->
                                <v-slider v-for="s in scoreString" v-model="score[t.type][s.type]" :color="s.color"
                                    :thumb-color="s.color" :track-color="scoreColor.criticalPrefect" :label=s.name
                                    step="1" :max="caculateMax(t.type, score[t.type][s.type])" thumb-label="always">
                                    <template v-slot:prepend>
                                        <v-btn @click="decreaseScore(t.type, s.type)" icon="mdi-minus"
                                            variant="text"></v-btn>
                                    </template>

                                    <template v-slot:append>
                                        <v-btn @click="increaseScore(t.type, s.type)" icon="mdi-plus"
                                            variant="text"></v-btn>
                                    </template>
                                </v-slider>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-divider></v-divider>
                                <h3 class="mt-3 mb-3">Break - {{ notesDetails.break }}</h3>
                                <v-slider v-model="criticalPrefect.break" label="CPrefect" step="1"
                                    :max="notesDetails.break" :color="scoreColor.criticalPrefect" thumb-label="always"
                                    readonly>
                                </v-slider>
                                <v-slider v-for="s in breakScoreString" v-model="score.break[s.type]" :color="s.color"
                                    :thumb-color="s.color" :track-color="scoreColor.criticalPrefect" :label=s.name
                                    step="1" :max="caculateMax('break', score.break[s.type])" thumb-label="always">
                                    <template v-slot:prepend>
                                        <v-btn @click="decreaseScore('break', s.type)" icon="mdi-minus"
                                            variant="text"></v-btn>
                                    </template>

                                    <template v-slot:append>
                                        <v-btn @click="increaseScore('break', s.type)" icon="mdi-plus"
                                            variant="text"></v-btn>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-snackbar v-model="snackbar" :timeout="2000">
            {{ snackbarText }}
        </v-snackbar>
    </v-container>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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

const snackbar = ref(false)
const snackbarText = ref('')

const scoreColor = {
    criticalPrefect: 'yellow',
    prefect: 'amber',
    great: 'pink-accent-1',
    good: 'green-lighten-1',
    miss: 'grey',
}

const basicTypeString = {
    tap: {
        name: 'Tap',
        type: 'tap' as BasicNoteType,
        color: 'blue',
    },
    hold: {
        name: 'Hold',
        type: 'hold' as BasicNoteType,
        color: 'purple',
    },
    slide: {
        name: 'Slide',
        type: 'slide' as BasicNoteType,
        color: 'red',
    },
    touch: {
        name: 'Touch',
        type: 'touch' as BasicNoteType,
        color: 'green',
    },
}

const scoreString = {
    prefect: {
        name: 'Prefect',
        type: 'prefect' as BasicScoreType,
        color: 'amber',
    },
    great: {
        name: 'Great',
        type: 'great' as BasicScoreType,
        color: 'pink-accent-1',
    },
    good: {
        name: 'Good',
        type: 'good' as BasicScoreType,
        color: 'green-lighten-1',
    },
    miss: {
        name: 'Miss',
        type: 'miss' as BasicScoreType,
        color: 'grey',
    },
}

const breakScoreString = {
    prefect: {
        name: 'Prefect-50',
        type: 'prefect' as ScoreType,
        color: 'amber',
    },
    prefect1: {
        name: 'Prefect-100',
        type: 'prefect1' as ScoreType,
        color: 'amber',
    },
    great: {
        name: 'Great-600',
        type: 'great' as ScoreType,
        color: 'pink-accent-1',
    },
    great1: {
        name: 'Great-700',
        type: 'great1' as ScoreType,
        color: 'pink-accent-1',
    },
    great2: {
        name: 'Great-850',
        type: 'great2' as ScoreType,
        color: 'pink-accent-1',
    },
    good: {
        name: 'Good',
        type: 'good' as ScoreType,
        color: 'green-lighten-1',
    },
    miss: {
        name: 'Miss',
        type: 'miss' as ScoreType,
        color: 'grey',
    },
}
const keyListNote = ['tap', 'hold', 'slide', 'touch', 'break'];
const keyListScore = ['prefect', 'great', 'good', 'miss'];

type BasicNoteType = 'tap' | 'hold' | 'slide' | 'touch';
type NoteType = 'tap' | 'hold' | 'slide' | 'touch' | 'break';
type BasicScoreType = 'prefect' | 'great' | 'good' | 'miss';
type ScoreType = 'prefect' | 'great' | 'good' | 'miss' | 'prefect1' | 'great' | 'great1' | 'great2' | 'good';


function increaseScore(noteType: NoteType, scoreType: ScoreType) {
    if (scoreType === 'prefect1' || scoreType === 'great1' || scoreType === 'great2') {
        score.value.break[scoreType]++
        return
    }
    if (criticalPrefect.value[noteType] === 0) {
        return
    }
    score.value[noteType][scoreType]++
}
function decreaseScore(noteType: NoteType, scoreType: ScoreType) {
    if (scoreType === 'prefect1' || scoreType === 'great1' || scoreType === 'great2') {
        score.value.break[scoreType]++
        return
    }
    if (score.value[noteType][scoreType] === 0) {
        return
    }
    score.value[noteType][scoreType]--
}

function caculateMax(noteType: string, noteCount: number) {
    if (noteType === 'tap') {
        return notesDetails.value.tap - score.value.tap.prefect - score.value.tap.great - score.value.tap.good - score.value.tap.miss + noteCount
    } else if (noteType === 'hold') {
        return notesDetails.value.hold - score.value.hold.prefect - score.value.hold.great - score.value.hold.good - score.value.hold.miss + noteCount
    } else if (noteType === 'slide') {
        return notesDetails.value.slide - score.value.slide.prefect - score.value.slide.great - score.value.slide.good - score.value.slide.miss + noteCount
    } else if (noteType === 'touch') {
        return notesDetails.value.touch - score.value.touch.prefect - score.value.touch.great - score.value.touch.good - score.value.touch.miss + noteCount
    } else if (noteType === 'break') {
        return notesDetails.value.break - score.value.break.prefect - score.value.break.prefect1 - score.value.break.great1 - score.value.break.great2 - score.value.break.great - score.value.break.good - score.value.break.miss + noteCount
    }
    return 0
}


const diffString = [
    { level: 1, name: 'Basic', color: 'green' },
    { level: 2, name: 'Advance', color: 'yellow' },
    { level: 3, name: 'Expert', color: 'red' },
    { level: 4, name: 'Master', color: 'purple' },
    { level: 5, name: 'Remaster', color: 'purple-lighten-4' },
]

const score = ref({
    tap: {
        prefect: 0,
        great: 0,
        good: 0,
        miss: 0,
    },
    hold: {
        prefect: 0,
        great: 0,
        good: 0,
        miss: 0,
    },
    slide: {
        prefect: 0,
        great: 0,
        good: 0,
        miss: 0,
    },
    touch: {
        prefect: 0,
        great: 0,
        good: 0,
        miss: 0,
    },
    break: {
        prefect: 0,
        prefect1: 0,
        great: 0,
        great1: 0,
        great2: 0,
        good: 0,
        miss: 0,
    },
})

const notesDetails = computed(() => {
    return selectedDiffList.value[selectedLevelIndex.value].notes
})

// 音符总数减去prefect，great，good，miss的数量
const criticalPrefect = computed(() => {
    return {
        tap: selectedDiffList.value[selectedLevelIndex.value].notes.tap -
            score.value.tap.prefect -
            score.value.tap.great -
            score.value.tap.good -
            score.value.tap.miss
        ,
        hold: selectedDiffList.value[selectedLevelIndex.value].notes.hold -
            score.value.hold.prefect -
            score.value.hold.great -
            score.value.hold.good -
            score.value.hold.miss
        ,
        slide: selectedDiffList.value[selectedLevelIndex.value].notes.slide -

            score.value.slide.prefect -
            score.value.slide.great -
            score.value.slide.good -
            score.value.slide.miss
        ,
        touch: selectedDiffList.value[selectedLevelIndex.value].notes.touch -
            score.value.touch.prefect -
            score.value.touch.great -
            score.value.touch.good -
            score.value.touch.miss
        ,
        break: selectedDiffList.value[selectedLevelIndex.value].notes.break -
            score.value.break.prefect -
            score.value.break.prefect1 -
            score.value.break.great -
            score.value.break.great1 -
            score.value.break.great2 -
            score.value.break.good -
            score.value.break.miss
    }
})

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

const totalScore = computed(() => {
    return (notesDetails.value.tap + notesDetails.value.touch) * 500 +
        notesDetails.value.hold * 1000 +
        notesDetails.value.slide * 1500 +
        notesDetails.value.break * 2500
})

const totalDXScore = computed(() => {
    return notesDetails.value.total * 3
})

const starNumber = computed(() => {
    let DXScore =
        (
            criticalPrefect.value.break +
            criticalPrefect.value.tap +
            criticalPrefect.value.touch +
            criticalPrefect.value.hold +
            criticalPrefect.value.slide
        ) * 3 +
        (
            score.value.tap.prefect +
            score.value.touch.prefect +
            score.value.hold.prefect +
            score.value.slide.prefect +
            score.value.break.prefect +
            score.value.break.prefect1
        ) * 2 +
        score.value.tap.great +
        score.value.touch.great +
        score.value.hold.great +
        score.value.slide.great +
        score.value.break.great +
        score.value.break.great1 +
        score.value.break.great2

    let starRate = DXScore / totalDXScore.value
    if (starRate >= 0.97) {
        return 5
    }
    if (starRate >= 0.95) {
        return 4
    }
    if (starRate >= 0.93) {
        return 3
    }
    if (starRate >= 0.9) {
        return 2
    }
    if (starRate >= 0.85) {
        return 1
    }
    return 0
})

const starNumberColor = computed(() => {
    if (starNumber.value === 5) {
        return 'yellow'
    }
    if (starNumber.value === 4) {
        return 'amber'
    }
    if (starNumber.value === 3) {
        return 'orange'
    }
    if (starNumber.value === 2) {
        return 'light-green-darken-1'
    }
    if (starNumber.value === 1) {
        return 'light-green-lighten-2'
    }
    return 'grey'
})

const totalAddScore = computed(() => {
    return notesDetails.value.break * 100
})
const finalScore = computed(() => {

    let basicTapTouchScore =
        (score.value.tap.prefect + criticalPrefect.value.tap + score.value.touch.prefect + criticalPrefect.value.touch) * 500 +
        (score.value.tap.great + score.value.touch.great) * 400 +
        (score.value.tap.good + score.value.touch.good) * 250
    let basicHoldScore =
        (score.value.hold.prefect + criticalPrefect.value.hold) * 1000 +
        (score.value.hold.great) * 800 +
        (score.value.hold.good) * 500
    let basicSlideScore =
        (score.value.slide.prefect + criticalPrefect.value.slide) * 1500 +
        (score.value.slide.great) * 1200 +
        (score.value.slide.good) * 750
    let basicBreakScore =
        (score.value.break.prefect + score.value.break.prefect1 + criticalPrefect.value.break) * 2500 +
        (score.value.break.great) * 2000 +
        (score.value.break.great1) * 1500 +
        (score.value.break.great2) * 1250 +
        (score.value.break.good) * 1000

    let basicTotalScoreRate = (basicTapTouchScore + basicHoldScore + basicSlideScore + basicBreakScore) / totalScore.value * 100

    let addScore = criticalPrefect.value.break * 100 +
        score.value.break.prefect * 75 +
        score.value.break.prefect1 * 50 +
        (score.value.break.great + score.value.break.great1 + score.value.break.great2) * 40 + score.value.break.good * 30

    let addScoreRate = addScore / totalAddScore.value
    return basicTotalScoreRate + addScoreRate
})

// 选择铺面
function selectLevelIndex(index: number) {
    selectedLevelIndex.value = index
}

// 工具方法：获取歌曲图片URL
function getSongImage(songID: number) {
    return `https://maimai.mpas.top/assets/cover/${songID}`
}
const clipboardContent = ref('');
const dataList = ref<number[]>([]);

const fromCopy = async () => {
    try {
        const text = await navigator.clipboard.readText();
        clipboardContent.value = text;
        console.log(clipboardContent.value);
        //转化为数字数组，用/t或/n分割
        dataList.value = clipboardContent.value.split(/\t|\n/).map(Number);
        console.log(dataList.value)
        //如果长度小于25，说明不是正确的数据，截取前25个数据
        if (dataList.value.length < 25) {
            snackbarText.value = '请检查剪切板数据是否正确';
            snackbar.value = true;
        }
        dataList.value = dataList.value.slice(0, 25);
        //验证每5项相加是否等于总数

        for (let i = 0; i < 5; i++) {
            let sum = dataList.value[i * 5] + dataList.value[i * 5 + 1] + dataList.value[i * 5 + 2] + dataList.value[i * 5 + 3] + dataList.value[i * 5 + 4];
            if (sum !== notesDetails.value[keyListNote[i] as NoteType]) {
                snackbarText.value = '请检查剪切板是否为匹配选的乐曲或难度';
                snackbar.value = true;
                return;
            }
        }

        criticalPrefect.value.tap = dataList.value[0];
        criticalPrefect.value.hold = dataList.value[5];
        criticalPrefect.value.slide = dataList.value[10];
        criticalPrefect.value.touch = dataList.value[15];
        criticalPrefect.value.break = dataList.value[20];

        for (let i = 0; i < 4; i++) {
            for (let j = 1; j < 5; j++) {
                score.value[keyListNote[i] as NoteType][keyListScore[j - 1] as BasicScoreType] = dataList.value[i * 5 + j];
            }
        }
        snackbarText.value = '导入成功';
        snackbar.value = true;

    } catch (err) {
        snackbarText.value = '读取剪切板失败';
        snackbar.value = true;
    }
};

function getRateImage(rate: number) {
    const baseUrl1 = 'https://maimai.mpas.top/assets/rank/'
    const baseUrl2 = 'https://maimai.mpas.top/assets/prism/'
    if (rate >= 100.5) {
        return baseUrl2 + 'sssp.png'
    }
    if (rate >= 100) {
        return baseUrl2 + 'sss.png'
    }
    if (rate >= 99.5) {
        return baseUrl2 + 'sp.png'
    }
    if (rate >= 99) {
        return baseUrl2 + 'ss.png'
    }
    if (rate >= 98) {
        return baseUrl2 + 'sp.png'
    }
    if (rate >= 97) {
        return baseUrl2 + 's.png'
    }
    if (rate >= 94) {
        return baseUrl1 + 'aaa'
    }
    if (rate >= 90) {
        return baseUrl1 + 'aa'
    }
    if (rate >= 80) {
        return baseUrl1 + 'a'
    }
    if (rate >= 75) {
        return baseUrl1 + 'bbb'
    }
    if (rate >= 70) {
        return baseUrl1 + 'bb'
    }
    if (rate >= 60) {
        return baseUrl1 + 'b'
    }
    return baseUrl1 + 'd'
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

//禁用双击缩放
const disableDoubleTapZoom = (event: MouseEvent) => {
    if (event.detail > 1) {
        event.preventDefault();
    }
};
const stickyCard = ref<HTMLElement | null>(null);
const stickyDiv = ref<HTMLElement | null>(null);
const originalPosition = ref<number | null>(null);
const cardWidth = ref(0);

const handleScroll = () => {
    if (stickyCard.value && stickyDiv.value) {
        const rect = stickyCard.value.getBoundingClientRect();
        if (rect.top <= 69 && !stickyCard.value.classList.contains('fixed-top')) {
            cardWidth.value = stickyCard.value.offsetWidth;
            stickyCard.value.classList.add('fixed-top');
            stickyDiv.value.classList.remove('non');
            stickyDiv.value.classList.add('fake-card');
            originalPosition.value = document.documentElement.scrollTop || document.body.scrollTop;
            stickyCard.value.style.width = `${cardWidth.value}px`;


        }

        let nowPosition = document.documentElement.scrollTop || document.body.scrollTop;
        if (nowPosition < originalPosition.value! && stickyCard.value.classList.contains('fixed-top')) {
            stickyDiv.value.classList.add('non');
            stickyDiv.value.classList.remove('fake-card');
            stickyCard.value.classList.remove('fixed-top');
            stickyCard.value.style.width = 'auto';
        }
    }
};

onMounted(() => {
    document.addEventListener('dblclick', disableDoubleTapZoom);
    window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
    document.removeEventListener('dblclick', disableDoubleTapZoom);
    window.removeEventListener('scroll', handleScroll);
});

</script>


<style>
.score-text {
    font-size: 1.5rem;
    font-weight: bold;
}

.sticky-card {
    transition: all 0.3s ease;
}

.fixed-top {
    position: fixed;
    top: 50px;
    z-index: 1000;
}

.non {
    display: none;
}

.fake-card {
    display: flex;
    width: 10px;
    height: 138px;
}
</style>