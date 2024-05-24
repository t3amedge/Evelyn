// import { captureException } from '@sentry/browser';
import { Discord, On, ArgsOf, Guard } from 'discordx';
import { IsBlacklisted } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class OnInteraction {
	@On({ event: 'interactionCreate' })
	@Guard(IsBlacklisted)
	async onInteraction(
		[interaction]: ArgsOf<'interactionCreate'>,
		client: Evelyn,
	) {
		try {
			await client.executeInteraction(interaction);
		}
		catch (err) {
			console.log(err);
			// return captureException(err);
		}
	}
}
