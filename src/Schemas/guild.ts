import { model, Schema } from 'mongoose';
import { HexColorString } from 'discord.js';

export interface EmbedInterface {
	/** The message that will be sent alongside the embed. If defined, that is otherwise it doesn't do shit. */
	content: string;
	/** The title of the embed. */
	title: string;
	/** The description of the embed. */
	description: string;
	/** The color of the embed. */
	color: HexColorString;
	/** The author object. */
	author: {
		/** The name of the author. */
		name: string;
		/** The icon URL of the author. */
		icon_url: string;
	};
	/** The image object. */
	image: {
		/** The URL of the image. */
		url: string;
	};
	/** The thumbnail object. */
	thumbnail: {
		/** The URL of the thumbnail. */
		url: string;
	};
	/** The footer object. */
	footer: {
		/** The text of the footer. */
		text: string;
		/** The icon URL of the footer. */
		icon_url: string;
	};
}

export interface GuildInterface {
	/** The ID of the server. */
	guildId: string;

	logs: {
		/** Indicates if the logging system is enabled or not. */
		enabled: boolean;
		/** The ID of the channel where the webhook was created. */
		channel: string;
		/** The object housing the webhook data. */
		webhook: {
			/** The ID of the webhook. */
			id: string;
			/** The encrypted token of the webhook. */
			token: string;
		};
	};
	welcome: {
		/** Indicates if the welcome system is enabled or not. */
		enabled: boolean;
		/** The ID of the channel where the welcome will send messages in. */
		channel: string;
		/** The object housing the embed data. */
		embed: EmbedInterface;
	};
	goodbye: {
		/** Indicates if the goodbye system is enabled or not. */
		enabled: boolean;
		/** The ID of the channel where the goodbye will send messages in. */
		channel: string;
		/** The object housing the embed data. */
		embed: EmbedInterface;
	};
	blacklist: {
		/** Indicates if the server is blacklisted or not. */
		isBlacklisted: boolean;
		/** The reason the server is blacklisted for. */
		reason: string;
		/** When the server was blacklisted. */
		time: number;
	};
	tickets: {
		/** Indicates if the tickets system is enabled or not. */
		enabled: boolean;
		/** The object housing the embed data. */
		embed: EmbedInterface;
		/** The ID of the channel where the transcripts will be sent in. */
		transcriptChannel: string;
		/** The ID of the role that will be pinged when a new ticket is created. */
		assistantRole: string;
	};
	levels: {
		/** Indicates if the levelling system is enabled or not. */
		enabled: boolean;
		/** The ID of the channel where the level up messages will be sent in. */
		channel: string;
		/** The message that will be sent when someone levels up. */
		message: string;
		/** The array of restricted roles. */
		restrictedRoles: string[];
		/** The array of restricted channels. */
		restrictedChannels: string[];
	};
	confessions: {
		/** Indicates if the confessions system is enabled or not. */
		enabled: boolean;
		/** The ID of the channel where the webhook was created. */
		channel: string;
		/** The object housing the webhook data. */
		webhook: {
			/** The ID of the webhook. */
			id: string;
			/** The encrypted token of the webhook. */
			token: string;
		};
	};
	antiphishing: {
		/** Indicates if the anti-phishing system is enabled or not. */
		enabled: boolean;
	};
	verification: {
		/** Indicates if the verification system is enabled or not. */
		enabled: boolean;
		/** The role that will be assigned to users upon verification. */
		role: string;
	};
	starboard: {
		/** Indicates if the starboard system is enabled or not. */
		enabled: boolean;
		/** The channel where the starred messages will be sent in. */
		starboardChannel: string;
		/** The number of star reactions is needed to send the message to the channel. */
		starsRequirement: number;
	}
}

export const GuildDB = model<GuildInterface>(
	'Guild',
	new Schema<GuildInterface>({
		guildId: String,
		logs: {
			enabled: Boolean,
			channel: String,
			webhook: {
				id: String,
				token: String,
			},
		},
		welcome: {
			enabled: Boolean,
			channel: String,
			embed: Object,
		},
		goodbye: {
			enabled: Boolean,
			channel: String,
			embed: Object,
		},
		blacklist: {
			isBlacklisted: Boolean,
			reason: String,
			time: Number,
		},
		tickets: {
			enabled: Boolean,
			embed: Object,
			transcriptChannel: String,
			assistantRole: String,
		},
		levels: {
			enabled: Boolean,
			channel: String,
			message: String,
			restrictedRoles: [String],
			restrictedChannels: [String],
		},
		confessions: {
			enabled: Boolean,
			channel: String,
			webhook: {
				id: String,
				token: String,
			},
		},
		antiphishing: {
			enabled: Boolean,
		},
		verification: {
			enabled: Boolean,
			role: String,
		},
		starboard: {
			enabled: Boolean,
			starboardChannel: String,
			starsRequirement: Number,
		},
	}),
);
