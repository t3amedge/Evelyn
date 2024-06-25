import type { ExtendedPlayer } from "src/utils/extendedManager";
import type { Track } from "lavalink-client";

export default class QueueEndEvent {
    public name: string = 'queueEnd';
    public isLLManagerEvent: boolean = false;
    
    async execute(player: ExtendedPlayer, _track: Track, _payload: unknown) {
        if (player.nowPlayingMessage?.deletable) await player.nowPlayingMessage?.delete();
    }
}