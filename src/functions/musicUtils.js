/**
 * This is the file for the Music Utilities.
 * The main purpose of this file is having some common functions to avoid repeated code.
 */

const { EmbedBuilder } = require("discord.js");
const pms = require("pretty-ms");

module.exports = class MusicUtils {
  /** Creates a new instance of the Music Utils Engine class. */
  constructor(interaction, player) {
    /** The interaction object. */
    this.interaction = interaction;
    /** The base embed used for keeping away from repeated code. */
    this.embed = new EmbedBuilder().setColor("Blurple").setTimestamp();
    /** The player object. */
    this.player = player;

    /** Returns if the player isn't defined. */
    if (this.player) return;
  }

  /** Generates the progress bar for the Now Playing command. */
  progressbar() {
    const size = 15;
    const line = "▬";
    const slider = "🔘";

    if (!this.player.queue.current) return `${slider}${line.repeat(size - 1)}]`;
    const current =
      this.player.queue.current.length !== 0
        ? this.player.shoukaku.position
        : this.player.queue.current.length;
    const total = this.player.queue.current.length;
    const barSize = Math.min(current, total);
    const bar = line.repeat(barSize) + line.slice(-1);
    const barFilled = bar.slice(0, -1) + slider;

    if (current > total) return `${barFilled}${line.repeat(size - barSize)}`;
    return `${bar}${line.repeat(size - barSize)}`;
  }

  /** Handles all checks regarding songs, queues etc. */
  check() {
    const VC = this.interaction.member.voice.channel;
    const botVC = this.interaction.guild.members.me.voice.channelId;

    if (!this.player?.playing && this.player?.queue.length === 0)
      return this.interaction.editReply({
        embeds: [
          this.embed.setDescription(
            "If you're seeing this embed instead of the one you requested, something bad happened in the background.\n\nYou're seeing this either\na) the bot isn't playing;\nb) the queue is empty.\n\nIn this case, just queue 2 songs for the queue to exist or 1 song for it to be actually playing. :)"
          ),
        ],
      });

    if (!VC)
      return this.interaction.editReply({
        embeds: [
          this.embed.setDescription(
            "🔹 | You need to be in a voice channel to use this command."
          ),
        ],
      });

    if (botVC && VC.id !== botVC)
      return this.interaction.editReply({
        embeds: [
          this.embed.setDescription(
            `🔹 | Sorry but I'm already playing music in <#${botVC}>.`
          ),
        ],
      });
  }

  /** This function switches the repeat modes. */
  async repeatMode(mode) {
    switch (mode) {
      default:
        break;

      case "queue":
        await this.player.setLoop("queue");

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription("🔹 | Repeat mode is now on. (Queue)"),
          ],
        });

      case "song":
        await this.player.setLoop("track");

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription("🔹 | Repeat mode is now on. (Song)"),
          ],
        });

      case "none":
        await this.player.setLoop("off");

        return this.interaction.editReply({
          embeds: [this.embed.setDescription("🔹 | Repeat mode is now off.")],
        });
    }
  }

  /** This function seeks to the time provided by you. */
  async seek(time) {
    const duration = Number.isInteger(time * 1000);
    const trackDuration = this.player.queue.track.length;

    if (duration > trackDuration)
      return this.interaction.editReply({
        embeds: [this.embed.setDescription(`🔹 | Invalid seek time.`)],
      });

    await this.player.shoukaku.seekTo(duration);

    return this.interaction.editReply({
      embeds: [this.embed.setDescription(`🔹 | Seeked to ${pms(duration)}.`)],
    });
  }

  /** Checks if the volume is between 0 and 100. */
  clampVolume(volume) {
    if (volume > 100 || volume < 0)
      return this.interaction.editReply({
        embeds: [
          this.embed.setDescription(
            "🔹| You can only set the volume from 0 to 100."
          ),
        ],
        ephemeral: true,
      });

    return Math.min(Math.max(volume, 0), 100);
  }

  /** Sets the volume for the player. */
  setVolume(volume) {
    const clampedVolume = this.clampVolume(volume);
    this.player.setVolume(clampedVolume);

    return this.interaction.editReply({
      embeds: [
        this.embed
          .setDescription(
            `🔹 | Volume has been set to **${this.player.volume * 100}%**.`
          )
          .setFooter({
            text: `Action executed by ${this.interaction.user.username}.`,
            iconURL: this.interaction.user.avatarURL({ dynamic: true }),
          }),
      ],
    });
  }

  /** Easily manage filters. */
  async filters(mode) {
    switch (mode) {
      case "3d":
        await this.player.send({
          op: "filters",
          guildId: this.interaction.guild.id,
          rotation: { rotationHz: 0.2 },
        });

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription("🔹 | The 3D filter has been applied."),
          ],
        });
      case "bass":
        await this.player.send({
          op: "filters",
          guildId: this.interaction.guild.id,
          equalizer: [
            { band: 0, gain: 0.1 },
            { band: 1, gain: 0.1 },
            { band: 2, gain: 0.05 },
            { band: 3, gain: 0.05 },
            { band: 4, gain: -0.05 },
            { band: 5, gain: -0.05 },
            { band: 6, gain: 0 },
            { band: 7, gain: -0.05 },
            { band: 8, gain: -0.05 },
            { band: 9, gain: 0 },
            { band: 10, gain: 0.05 },
            { band: 11, gain: 0.05 },
            { band: 12, gain: 0.1 },
            { band: 13, gain: 0.1 },
          ],
        });

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription("🔹 | The Bass filter has been applied."),
          ],
        });
      case "bassboost":
        await this.player.send({
          op: "filters",
          guildId: this.interaction.guild.id,
          equalizer: [
            { band: 0, gain: 0.1 },
            { band: 1, gain: 0.1 },
            { band: 2, gain: 0.05 },
            { band: 3, gain: 0.05 },
            { band: 4, gain: -0.05 },
            { band: 5, gain: -0.05 },
            { band: 6, gain: 0 },
            { band: 7, gain: -0.05 },
            { band: 8, gain: -0.05 },
            { band: 9, gain: 0 },
            { band: 10, gain: 0.05 },
            { band: 11, gain: 0.05 },
            { band: 12, gain: 0.1 },
            { band: 13, gain: 0.1 },
          ],
        });

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription(
              "🔹 | The `bass boost` filter has been applied."
            ),
          ],
        });
      case "nightcore":
        await this.player.send({
          op: "filters",
          guildId: this.interaction.guild.id,
          timescale: {
            speed: 1.1,
            pitch: 1.125,
            rate: 1.05,
          },
        });

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription(
              "🔹 | The `nightcore` filter has been applied."
            ),
          ],
        });
      case "pop":
        await this.player.send({
          op: "filters",
          guildId: this.interaction.guild.id,
          equalizer: [
            { band: 0, gain: 0.65 },
            { band: 1, gain: 0.45 },
            { band: 2, gain: -0.45 },
            { band: 3, gain: -0.65 },
            { band: 4, gain: -0.35 },
            { band: 5, gain: 0.45 },
            { band: 6, gain: 0.55 },
            { band: 7, gain: 0.6 },
            { band: 8, gain: 0.6 },
            { band: 9, gain: 0.6 },
            { band: 10, gain: 0 },
            { band: 11, gain: 0 },
            { band: 12, gain: 0 },
            { band: 13, gain: 0 },
          ],
        });

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription(
              "🔹 | The `Pop` filter has been applied."
            ),
          ],
        });

      case "slowmo":
        await this.player.send({
          op: "filters",
          guildId: this.interaction.guild.id,
          timescale: {
            speed: 0.5,
            pitch: 1.0,
            rate: 0.8,
          },
        });

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription("🔹 | The 3D filter has been applied."),
          ],
        });
      case "soft":
        await this.player.send({
          op: "filters",
          guildId: this.interaction.guild.id,
          equalizer: [
            { band: 0, gain: 0 },
            { band: 1, gain: 0 },
            { band: 2, gain: 0 },
            { band: 3, gain: 0 },
            { band: 4, gain: 0 },
            { band: 5, gain: 0 },
            { band: 6, gain: 0 },
            { band: 7, gain: 0 },
            { band: 8, gain: -0.25 },
            { band: 9, gain: -0.25 },
            { band: 10, gain: -0.25 },
            { band: 11, gain: -0.25 },
            { band: 12, gain: -0.25 },
            { band: 13, gain: -0.25 },
          ],
        });

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription(
              "🔹 | The `soft` filter has been applied."
            ),
          ],
        });
      case "tv":
        await this.player.send({
          op: "filters",
          guildId: this.interaction.guild.id,
          equalizer: [
            { band: 0, gain: 0 },
            { band: 1, gain: 0 },
            { band: 2, gain: 0 },
            { band: 3, gain: 0 },
            { band: 4, gain: 0 },
            { band: 5, gain: 0 },
            { band: 6, gain: 0 },
            { band: 7, gain: 0.65 },
            { band: 8, gain: 0.65 },
            { band: 9, gain: 0.65 },
            { band: 10, gain: 0.65 },
            { band: 11, gain: 0.65 },
            { band: 12, gain: 0.65 },
            { band: 13, gain: 0.65 },
          ],
        });

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription("🔹 | The `TV` filter has been applied."),
          ],
        });
      case "treblebass":
        await this.player.send({
          op: "filters",
          guildId: this.interaction.guild.id,
          equalizer: [
            { band: 0, gain: 0.6 },
            { band: 1, gain: 0.67 },
            { band: 2, gain: 0.67 },
            { band: 3, gain: 0 },
            { band: 4, gain: -0.5 },
            { band: 5, gain: 0.15 },
            { band: 6, gain: -0.45 },
            { band: 7, gain: 0.23 },
            { band: 8, gain: 0.35 },
            { band: 9, gain: 0.45 },
            { band: 10, gain: 0.55 },
            { band: 11, gain: 0.6 },
            { band: 12, gain: 0.55 },
            { band: 13, gain: 0 },
          ],
        });

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription(
              "🔹 | The `treble bass` filter has been applied."
            ),
          ],
        });
      case "tremolo":
        await this.player.send({
          op: "filters",
          guildId: this.interaction.guild.id,
          tremolo: { frequency: 4.0, depth: 0.75 },
        });

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription(
              "🔹 | The `tremolo` filter has been applied."
            ),
          ],
        });
      case "vaporwave":
        await this.player.send({
          op: "filters",
          guildId: this.interaction.guild.id,
          equalizer: [
            { band: 0, gain: 0 },
            { band: 1, gain: 0 },
            { band: 2, gain: 0 },
            { band: 3, gain: 0 },
            { band: 4, gain: 0 },
            { band: 5, gain: 0 },
            { band: 6, gain: 0 },
            { band: 7, gain: 0 },
            { band: 8, gain: 0.15 },
            { band: 9, gain: 0.15 },
            { band: 10, gain: 0.15 },
            { band: 11, gain: 0.15 },
            { band: 12, gain: 0.15 },
            { band: 13, gain: 0.15 },
          ],
          timescale: {
            pitch: 0.55,
          },
        });

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription(
              "🔹 | The `vaporwave` filter has been applied."
            ),
          ],
        });
      case "vibrate":
        await this.player.send({
          op: "filters",
          guildId: this.interaction.guild.id,
          vibrato: { frequency: 4.0, depth: 0.75 },
          tremolo: { frequency: 4.0, depth: 0.75 },
        });

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription(
              "🔹 | The `vibrate` filter has been applied."
            ),
          ],
        });
      case "vibrato":
        await this.player.send({
          op: "filters",
          guildId: this.interaction.guild.id,
          vibrato: { frequency: 4.0, depth: 0.75 },
        });

        return this.interaction.editReply({
          embeds: [
            this.embed.setDescription(
              "🔹 | The `vibrato` filter has been applied."
            ),
          ],
        });
      case "reset":
        await this.player.send({
          op: "filters",
          guildId: this.interaction.guild.id,
        });

        this.setVolume(100);

        return this.interaction.editReply({
          embeds: [this.embed.setDescription("🔹 | Filters have been reset.")],
        });
      default:
        break;
    }
  }
};
