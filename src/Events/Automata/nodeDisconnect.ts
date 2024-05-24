import { Node } from '@shadowrunners/automata';
import { Evelyn } from '@Evelyn';

export default class NodeDisconnect {
	name = 'nodeDisconnect';

	execute(node: Node, _event: unknown, client: Evelyn) {
		client.evieLogger.error(`[Lavalink] Lost connection to node ${node.options.name}.`);
	}
}
