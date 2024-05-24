import '@abraham/reflection';
import { Client, DIService } from 'discordx';
import { BotConfig, config } from '@Config';
import { container } from 'tsyringe';
import { Manager } from '@shadowrunners/automata';
import { dirname, importx } from '@discordx/importer';
import { GatewayIntentBits, Options, Partials } from 'discord.js';
import { fileLoad } from '@Helpers/fileLoader.js';
import { DatabaseType, Giveaways } from 'discord-giveaways-super';
import { tsyringeDependencyRegistryEngine } from '@discordx/di';
import Logger from '@ptkdev/logger';
// import Economy from 'discord-economy-super/mongodb/src/index.js';

const {
	Guilds,
	GuildMessages,
	GuildMembers,
	GuildModeration,
	GuildEmojisAndStickers,
	GuildMessageReactions,
	GuildVoiceStates,
	MessageContent,
	DirectMessages,
} = GatewayIntentBits;

export class Evelyn extends Client {
	public config: BotConfig;
	// To implement later. This shit takes too much time.
	// public economy: Economy<boolean>;
	public manager: Manager;
	public giveaways: Giveaways<DatabaseType.MONGODB>;
	private client: Client;
	public evieLogger: Logger;

	constructor() {
		super({
			intents: [
				Guilds,
				GuildMembers,
				GuildMessages,
				GuildModeration,
				GuildVoiceStates,
				GuildEmojisAndStickers,
				GuildMessageReactions,
				MessageContent,
				DirectMessages,
			],
			partials: [
				Partials.Reaction,
				Partials.Message,
			],
			silent: config.debug.logs.disableDX,
			makeCache: Options.cacheWithLimits({
				...Options.DefaultMakeCacheSettings,
				GuildInviteManager: 0,
				GuildScheduledEventManager: 0,
				PresenceManager: 0,
				// ReactionUserManager: 0,
				StageInstanceManager: 0,
			}),
			sweepers: {
				...Options.DefaultSweeperSettings,
				messages: {
					// Clear the message cache every 12 hours.
					interval: 43200,
					filter: () => (message) =>
						// Removes all bots.
						message.author.bot && message.author.id !== this.client.user.id,
				},
			},
		});

		this.config = config;
		this.client = this;

		this.manager = new Manager({
			nodes: this.config.music.nodes,
			reconnectTries: 3,
			reconnectTimeout: 5000,
			resumeStatus: true,
			resumeTimeout: 5000,
			defaultPlatform: 'dzsearch',
		});

		this.giveaways = new Giveaways(this.client, {
			database: DatabaseType.MONGODB,
			connection: {
				connectionURI: this.config.database,
				collectionName: 'Giveaways',
				dbName: 'test',
			},
			debug: this.config.debug.logs.disableGiveawaysLogs,
		});

		this.evieLogger = new Logger({
			language: 'en',
			colors: true,
			debug: true,
			info: true,
			warning: true,
			error: true,
			sponsor: true,
			type: 'log',
			rotate: {
				size: '10M',
				encoding: 'utf8',
			},
		});

		// TODO: Replace this with Sentry stuff.
		process.on('unhandledRejection', (err) => console.log(err));
		process.on('unhandledException', (err) => console.log(err));
	}

	/**
	 * Loads music events.
	 * @param {Evelyn} client - The client object.
	 * @returns {Promise<void>}
	 */
	async loadMusic(client: Evelyn): Promise<void> {
		const files = await fileLoad('Events/Automata');
		for (const file of files) {
			const eventModule = await import(`file://${file}`);
			const event = new eventModule.default();

			const execute = (...args: string[]) => event.execute(...args, client);

			client.manager.on(event.name, execute);

			this.evieLogger.info(`[Automata] Loaded ${event.name}.ts`);
		}
	}

	/** Imports all commands and events then launches a new instance of the bot. */
	public async launch() {
		DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);

		await importx(
			`${dirname(import.meta.url)}/{Events/djxManaged,Commands}/**/*.{ts,js}`,
		);

		if (config.debug.telemetry.enabled) {
			const { addTracingExtensions, init } = await import('@sentry/browser');
			const { ProfilingIntegration } = await import('@sentry/profiling-node');

			addTracingExtensions();
			init({
				dsn: this.config.debug.telemetry.dsn,
				tracesSampleRate: 1.0,
				profilesSampleRate: 1.0,
				integrations: [
					new ProfilingIntegration(),
				],
			});

			this.evieLogger.info('[Telemetry] Sentry has been successfully initialized.');
		}

		container.registerInstance(Evelyn, this.client);

		await this.loadMusic(this);
		await this.client.login(this.config.token);
	}
}
