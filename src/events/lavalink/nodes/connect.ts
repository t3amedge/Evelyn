import type { LavalinkNode } from "lavalink-client/dist/types";
import { Evelyn } from "@Evelyn";

export default class NodeConnectEvent {
    public name: string = 'connect';
    public isLLManagerEvent: boolean = true;
    
    execute(node: LavalinkNode, client: Evelyn) {
        return client.logging.info(`Connected to node ${node.options.id}`)
    }
}