import { check4Lockdowns } from '@/Utils/Checks/check4Lockdowns.js';
import { reminderCheck } from '@Helpers/reminderUtils.js';
import { ActivityType } from 'discord.js';
import { Discord, Once } from 'discordx';
import { Evelyn } from '@Evelyn';
import { connect } from 'mongoose';

@Discord()
export class Ready {
	@Once({ event: 'ready' })
	async ready([client]: [Evelyn]) {
		const { user, config, manager } = client;

		if (!config.database) {
			client.evieLogger.error('Couldn\'t establish a connection to the database, please check your config.ts file.');
			return process.exit();
		}

		client.evieLogger.info(`[Discord API] Logged in as ${client.user.tag}.`);

		user.setPresence({
			activities: [
				{
					name: 'it\'s morbin time baby :)',
					type: ActivityType.Streaming,
				},
			],
		});

		await client.initApplicationCommands();
		manager.init(client);

		connect(config.database)
			.then(() => {
				client.evieLogger.info(`[DB] ${client.user.username} has successfully connected to the database.`);
			})
			.catch((err) => {
				client.evieLogger.error(`[DB] ${err}`);
			});

		await reminderCheck(client);
		await check4Lockdowns(client);
	}
}
