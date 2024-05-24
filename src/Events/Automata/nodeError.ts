import { Node } from '@shadowrunners/automata';
import { Evelyn } from '@Evelyn';

export default class NodeError {
	name = 'nodeError';

	execute(node: Node, error: Error, client: Evelyn) {
		return client.evieLogger.error(`[Lavalink] Node "${node.options.name}" has encountered an error: ${error.message}.`);
	}
}
