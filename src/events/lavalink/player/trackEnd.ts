import { ExtendedPlayer } from "src/utils/extendedManager";
import type { Track } from "lavalink-client";

export default class TrackEndEvent {
    public name: string = 'trackEnd';
    public isLLManagerEvent: boolean = false;
    
    async execute(player: ExtendedPlayer, _track: Track, _payload: unknown) {
        if (player.nowPlayingMessage?.deletable) return await player.nowPlayingMessage?.delete();
    }
}