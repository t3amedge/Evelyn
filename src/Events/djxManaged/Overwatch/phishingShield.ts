import { validate, send } from '../../../Utils/Helpers/loggerUtils.js';
import { EmbedBuilder, Message } from 'discord.js';
import { Evelyn } from '../../../Evelyn.js';
import { config } from '../../../config.js';
import { Discord, On } from 'discordx';
import superagent from 'superagent';

@Discord()
export class PhishingShield {
	@On({ event: 'messageCreate' })
	async execute([message]: [Message], client: Evelyn) {
		if (message.partial) await message.fetch();

		const { content, guildId, author } = message;
		const bodyReg =
			/^(?=.{1,254}$)((?!-)[A-Za-z0-9-]{1,63}(?<!\.)\.)+[A-Za-z]{2,}$/;

		if (bodyReg.test(content)) {
			try {
				const res = await superagent
					.post('https://anti-fish.bitflow.dev/check')
					.send({ message: content })
					.set('User-Agent', config.userAgent);

				if (res.status === 200 && (await validate(guildId))) {
					const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();
					const { match } = res.body;

					await message.delete();

					return await send({
						guild: guildId,
						client,
						embed: embed
							.setTitle('⚠️ | Phishing Link Detected')
							.setDescription(
								'The Anti-Phishing Shield has blocked a potentially dangerous link.',
							)
							.addFields(
								{ name: '🔹 | Posted by', value: `> ${author}` },
								{ name: '🔹 | Flagged Content', value: `> ${content}` },
								{
									name: '🔹 | Link Type',
									value: `> ${match.matches[0].type}`,
								},
							),
					});
				}
				else if (res.status === 404 && !res.body.match) return false;
			}
			catch (error) {
				if (error.response && error.response.status === 404) return false;
			}
		}
	}
}
