import { Node } from '@shadowrunners/automata';
import { Evelyn } from '@Evelyn';

export default class NodeConnect {
	name = 'nodeConnect';

	execute(node: Node, client: Evelyn) {
		client.evieLogger.info(`[Lavalink] Connected to node ${node.options.name}.`);
	}
}
