/**
 * This class contains Evelyn's custom playlist system to give users a way to save their favorite songs.
 */
const PDB = require("../structures/schemas/playlist.js");
const { embedPages } = require("../functions/utils.js");
const { EmbedBuilder } = require("discord.js");
const pms = require("pretty-ms");

module.exports = class PlaylistEngine {
  constructor(interaction) {
    this.interaction = interaction;
    this.embed = new EmbedBuilder().setColor("Blurple").setTimestamp();
  }

  /** Checks to see if there is any data with the name you provided. */
  async validatePlaylist(pName) {
    const playlistData = await PDB.findOne({
      userID: this.interaction.user.id,
      playlistName: pName,
    });

    if (!playlistData)
      return this.interaction.editReply({
        embeds: [
          this.embed.setDescription(
            "🔹 | There is no playlist with that name or no data regarding that user."
          ),
        ],
        ephemeral: true,
      });
  }

  /** Adds the current track to your playlist. */
  async addCurrentTrack(player, pName) {
    const track = player.queue.current;

    if (!track)
      return this.interaction.editReply({
        embeds: [this.embed.setDescription("🔹 | Nothing is playing.")],
        ephemeral: true,
      });

    await PDB.updateOne(
      {
        userID: user.id,
        playlistName: pName,
      },
      {
        $push: {
          playlistData: {
            title: track.title,
            uri: track.uri,
            author: track.author,
            duration: track.length,
          },
        },
      }
    );

    return interaction.editReply({
      embeds: [
        this.embed.setDescription(
          `🔹 | **[${track.title}](${track.uri})** has been added to your playlist.`
        ),
      ],
    });
  }

  /** Creates a new playlist. */
  async create(pName) {
    const userData = await PDB.findOne({
      userID: this.interaction.user.id,
    });

    if (pName.length > 12)
      return this.interaction.editReply({
        embeds: [
          this.embed.setDescription(
            "🔹 | The name of the playlist cannot be more than 12 characters."
          ),
        ],
      });

    if (userData?.length >= 10)
      return this.interaction.editReply({
        embeds: [
          this.embed.setDescription(
            "🔹 | You can only create 10 playlists at a time."
          ),
        ],
      });

    const data = await new PDB({
      name: this.interaction.user.username,
      userID: this.interaction.user.id,
      playlistName: playlistName,
      created: Math.round(Date.now() / 1000),
    });

    await data.save();

    return this.interaction.editReply({
      embeds: [
        this.embed.setDescription(
          `🔹 | Your playlist **${pName}** has been created.`
        ),
      ],
    });
  }

  /** Deletes a playlist. */
  async delete(pName) {
    const playlistData = await PDB.findOne({
      userID: this.interaction.user.id,
      playlistName: pName,
    });

    if (validatePlaylist(playlistName)) return;

    await playlistData.delete();

    return this.interaction.editReply({
      embeds: [
        this.embed.setDescription(
          `🔹 | Your playlist **${pName}** has been deleted.`
        ),
      ],
    });
  }

  /** Shows information about a specific playlist. */
  async info(pName) {
    const pData = await PDB.findOne({
      playlistName: pName,
      userID: user.id,
    });

    if (this.validatePlaylist(pName)) return;

    let i = 0;
    const trackData = pData.playlistData;
    const list = pData.playlistData.length;
    const tracks = [];
    const embeds = [];

    for (i; i < list; i++) {
      tracks.push(
        `${i + 1} • **[${trackData[i].title}](${trackData[i].uri})** • [${pms(
          trackData[i].duration
        )}]`
      );
    }

    for (i = 0; i < tracks.length; i += 10) {
      this.embed
        .setTitle(`${pData.playlistName} by ${pData.name}`)
        .setDescription(tracks.slice(i, i + 10).join("\n"));
      embeds.push(embed);
    }

    return embedPages(client, interaction, embeds);
  }

  /** Shows all your playlists. */
  async list() {
    const pData = await PDB.find({
      userID: this.interaction.user.id,
    });

    if (!pData)
      return this.interaction.editReply({
        embeds: [this.embed.setDescription("🔹 | You have no playlists.")],
        ephemeral: true,
      });

    const playlists = [];
    const embeds = [];

    for (let i = 0; i < pData.length; i++) {
      playlists.push(
        `**${pData[i].playlistName}** • ${pData[i].playlistData?.length} song(s)`
      );
    }

    for (let i = 0; i < playlists.length; i += 10) {
      this.embed
        .setTitle(`Playlists curated by ${pData[i].name}`)
        .setDescription(playlists.slice(i, i + 10).join("\n"));
      embeds.push(embed);
    }

    return embedPages(client, interaction, embeds);
  }

  /** Removes the song provided from the specified playlist. */
  async removeThisSong(pName, song) {
    const pData = await PDB.findOne({
      playlistName: pName,
      userID: this.interaction.user.id,
    });

    if (!pData?.playlistData)
      return interaction.editReply({
        embeds: [
          embed.setDescription(
            "🔹 | There is no playlist with that name or no data regarding that user."
          ),
        ],
        ephemeral: true,
      });

    if (song >= pData?.playlistData.length || song < 0)
      return interaction.editReply({
        embeds: [
          this.embed.setDescription(
            "🔹 | Track ID is out of range, see your playlist via /playlist list (playlistName)"
          ),
        ],
        ephemeral: true,
      });

    await PDB.updateOne(
      {
        userID: this.interaction.user.id,
        playlistName: pName,
      },
      {
        $pull: {
          playlistData: pData.playlistData[song],
        },
      }
    );

    return interaction.editReply({
      embeds: [
        this.embed.setDescription(
          `🔹 | **${tracks[song].title}** has been removed from your playlist.`
        ),
      ],
    });
  }
};
