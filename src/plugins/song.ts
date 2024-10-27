// song.ts

export interface NoteCounts {
    total: number;
    tap: number;
    hold: number;
    slide: number;
    touch: number;
    break: number;
}

export interface Difficulty {
    type: string;
    level: string;
    level_value: number;
    note_designer: string;
    notes: NoteCounts;
}

export interface Song {
    SongID: number;
    title: string;
    artist: string;
    genre: string;
    bpm: number;
    map: string | null; // Allow for null if the map can be empty
    version: number;
    difficulties: {
        standard: Difficulty[];
        dx: Difficulty[];
    };
}

export function fetchSongDetails(songId: number): Promise<Song> {
    const adjustedId = songId > 10000 ? songId % 10000 : songId;
    return fetch(`https://maimai.lxns.net/api/v0/maimai/song/${adjustedId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => ({
            SongID: data.id,
            title: data.title,
            artist: data.artist,
            genre: data.genre,
            bpm: data.bpm,
            map: data.map,
            version: data.version,
            difficulties: {
                standard: data.difficulties.standard ? data.difficulties.standard.map((difficulty: any) => ({
                    type: difficulty.type,
                    level: difficulty.level,
                    level_value: difficulty.level_value,
                    note_designer: difficulty.note_designer,
                    notes: {
                        total: difficulty.notes.total,
                        tap: difficulty.notes.tap,
                        hold: difficulty.notes.hold,
                        slide: difficulty.notes.slide,
                        touch: difficulty.notes.touch,
                        break: difficulty.notes.break,
                    },
                })) : [],
                dx: data.difficulties.dx ? data.difficulties.dx.map((difficulty: any) => ({
                    type: difficulty.type,
                    level: difficulty.level,
                    level_value: difficulty.level_value,
                    note_designer: difficulty.note_designer,
                    notes: {
                        total: difficulty.notes.total,
                        tap: difficulty.notes.tap,
                        hold: difficulty.notes.hold,
                        slide: difficulty.notes.slide,
                        touch: difficulty.notes.touch,
                        break: difficulty.notes.break,
                    },
                })) : [],
            },
        }));
}
