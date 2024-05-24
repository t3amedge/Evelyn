import { type EvelynConfigurationOptions, config } from './config.js';
import { dirname, importx } from "@discordx/importer";
import { GatewayIntentBits } from "discord.js";
import { Client } from "discordx";

export class Evelyn extends Client {
    /** The configuration settings of Evelyn. */
    public config: EvelynConfigurationOptions;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent,
            ],
            silent: config.debug?.enableDiscordXDebugLogs ?? false,
            // Reimplement cache options from old code.
            // makeCache:
        });

        this.config = config;

        // TODO: Reimplement music manager.
    }

    public async launch() {
        if (!this.config.token) {
            console.error('No bot token provided.')
            return process.exit();
        }

        await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);
        await this.login(this.config.token);
    }
}

const evelyn = new Evelyn();
await evelyn.launch();