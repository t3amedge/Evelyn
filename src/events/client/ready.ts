import { Discord, Once } from "discordx";
import { Evelyn } from "@Evelyn";
import { inject, injectable } from "tsyringe";

@Discord()
@injectable()
export class ReadyEvent {
  constructor(@inject(Evelyn) private readonly client: Evelyn) {}

  @Once({ event: 'ready' })
  async ready(): Promise<void> {
    this.client.logging.info(`Signed in as ${this.client.user?.tag}.`)

    await this.client.initApplicationCommands();
  }
}
