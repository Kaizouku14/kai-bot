import { Client, GatewayIntentBits } from 'discord.js';
import { Bot } from './struct/bot';

export const bot = new Bot(new Client({ intents : [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ]}
))
