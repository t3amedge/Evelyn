import {
    LavalinkManager,
    type ManagerOptions,
    type MiniMap,
    Player,
    type PlayerOptions,
} from "lavalink-client";
import type { Message } from "discord.js";
import { Client } from "genius-lyrics";
import { config } from "src/config";

/** An extension of the base lavalink-client Manager to add more features on top of what's currently available. */
export class ExtendedManager extends LavalinkManager {
    constructor(options: ManagerOptions) {
        super(options);
    }

    // js/tsdoc auto filled
    public createPlayer(options: PlayerOptions): ExtendedPlayer {
        const oldPlayer = this.getPlayer(options?.guildId);
        if (oldPlayer) return oldPlayer;
        const newPlayer = new ExtendedPlayer(options, this);
        this.players.set(newPlayer.guildId, newPlayer);
        return newPlayer;
    }

    // js/tsdoc auto filled
    public getPlayer(guildId: string): ExtendedPlayer {
        return (this.players as MiniMap<string, ExtendedPlayer>).get(guildId) as ExtendedPlayer;
    }
}

export class ExtendedPlayer extends Player {
    // powered by genius lyrics, don't want to use lavalyrics
    private lyricsClient: Client = new Client(config.apis?.genius);
    /** The now playing message of the current song. */
    public nowPlayingMessage: Message | null = null;

    constructor({
        guildId,
        voiceChannelId,
        textChannelId,
        selfDeaf,
        selfMute,
    }: PlayerOptions,
    llManager: ExtendedManager,
) {
        super({
            guildId,
            voiceChannelId,
            textChannelId,
            selfDeaf,
            selfMute,
        }, llManager);
    }

    /**
     * Fetches the lyrics from the Genius API and returns them back.
     * @param query The name of the song + artist.
     * @returns The full lyrics of the song.
     */
    public async getLyrics(query: string): Promise<{ lyrics: string | undefined; url: string; } | null> {
        const res = await this.lyricsClient.songs.search(query);
        if (!res) return null;

        const lyrics = await res[0].lyrics();
    
        return {
            lyrics,
            url: res[0].url,
        };
    }

    /**
     * Gets and calculates the currently playing track's position.
     * Useful for canvas-based now playing images (such as musicard) or for making progress bars.
     */
    public get currentTrackPosition(): number {
        const playerPosition = this.position;
        const trackDuration = Number(this.queue.current?.info.duration);

        return Math.floor((playerPosition / trackDuration) * 100);
    }

    /**
     * Sets the now playing message.
     * @param message The now playing message of the current message;
     * @returns The message class of it.
     */
    public setNowPlayingMessage(message: Message) {
        this.nowPlayingMessage = message;
        return message;
    }

}