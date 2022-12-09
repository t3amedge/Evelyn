const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const Cluster = require("discord-hybrid-sharding");
const Statcord = require("statcord.js");

const { Kazagumo } = require("kazagumo");
const { Connectors } = require("shoukaku");
const Spotify = require("kazagumo-spotify");
const Deezer = require("kazagumo-deezer");

const {
  Guilds,
  GuildMessages,
  GuildBans,
  GuildMembers,
  GuildEmojisAndStickers,
  GuildMessageReactions,
  GuildInvites,
  GuildVoiceStates,
  MessageContent,
} = GatewayIntentBits;
const { User, Message, Channel, GuildMember, ThreadMember } = Partials;

const client = new Client({
  intents: [
    Guilds,
    GuildBans,
    GuildInvites,
    GuildMembers,
    GuildMessages,
    GuildVoiceStates,
    GuildMessageReactions,
    GuildEmojisAndStickers,
    MessageContent,
  ],
  partials: [User, Message, Channel, GuildMember, ThreadMember],
  shards: Cluster.data.SHARD_LIST,
  shardCount: Cluster.data.TOTAL_SHARDS,
});

const { loadEvents } = require("./handlers/events.js");
const { loadStats } = require("./handlers/statcord.js");
const { loadButtons } = require("./handlers/buttons.js");
const { loadShoukaku } = require("./handlers/shoukaku.js");

client.config = require("./config.json");
client.commands = new Collection();
client.subCommands = new Collection();
client.events = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.cluster = new Cluster.Client(client);

client.statcord = new Statcord.Client({
  client,
  key: client.config.debug.statKey,
  postCpuStatistics: true,
  postMemStatistics: true,
  postNetworkStatistics: true,
  autopost: true,
});

client.manager = new Kazagumo(
  {
    plugins: [
      new Spotify({
        clientId: client.config.music.spotifyClientID,
        clientSecret: client.config.music.spotifySecret,
      }),
      new Deezer({
        playlistLimit: 20,
      }),
    ],
    defaultSearchEngine: "youtube",
    send: (id, payload) => {
      const guild = client.guilds.cache.get(id);
      if (guild) guild.shard.send(payload);
    },
  },
  new Connectors.DiscordJS(client),
  client.config.music.nodes,
  {
    moveOnDisconnect: false,
    resume: true,
    resumeKey: "playerKey",
    reconnectTries: 5,
    restTimeout: 10000,
    resumeTimeout: 10000,
  }
);

module.exports = client;

loadEvents(client);
loadButtons(client);
loadStats(client);
loadShoukaku(client);

process.on("unhandledRejection", (err) => console.log(err));
process.on("unhandledException", (err) => console.log(err));

client.login(client.config.token);
