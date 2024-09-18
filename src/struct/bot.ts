import { Client, 
  REST,
  Routes ,
  ApplicationCommandDataResolvable, 
  Collection,
  ChatInputCommandInteraction,
  Events,
  Interaction,
  Presence,
  ActivityType,
  Activity,
  GuildMember,
  Message
} from "discord.js";
import { Command } from "../interfaces/Command"
import { readdirSync } from "fs";
import { join } from "path";
import keepAlive from "../utils/keepAlive";
import config from "../utils/config";
import { calculateDuration } from "../utils/util";
import { writeUserData } from "../utils/activityStats";
import { checkRecord, writeViolationStats } from "../utils/violationStats";

export class Bot {
    public slashCommands = new Array<ApplicationCommandDataResolvable>();
    public slashCommandsMap = new Collection<string, Command>();

    public constructor (public readonly client : Client){ 
        this.client.login(config.DISCORD_TOKEN);

        this.client.once('ready', client => {
            console.log(`Ready! Logged in as ${client.user?.tag}`);
                   
            keepAlive({ port : config.PORT });
            this.registerSlashCommands();
        });

        this.client.on("warn", (info) => console.log(info));
        this.client.on("error", console.error);
        this.client.on("guildMemberAdd", (member) => this.onGuildMemberAdd(member));
        this.client.on("messageCreate", (message) => this.onMessageCreate(message));
        this.onPresenceUpdate();
        this.onInteractionCreate();
    }
  
    private async onGuildMemberAdd (member: GuildMember) {
      const roleId = '1280128075874570250';
      const systemChannel = member.guild.systemChannel;
      const role = member.guild.roles.cache.get(roleId);

      if (systemChannel) {
        await systemChannel.send(`Welcome to the server, ${member}!`).catch(console.error);
      }

      if (role) {
        try {
          await member.roles.add(role);
          console.log(`Assigned the ${role.name} role to ${member.user.tag}`);
        } catch (error) {
          console.error(`Error assigning role: ${error}`);
        }
      }
    }

    private async onMessageCreate (message : Message){
      if(message.author.bot) return;

      const username = message.author.username;
      const userId = message.author.id;
      const msg = message.content.split(/\W+/).filter(Boolean);
      const filteredMessage = msg.filter(message => message.match(/nigger|nigga/i));

      if(filteredMessage.length > 0){
          const count = filteredMessage.length;
          const isValidUser = await checkRecord({ userId, count});

          if(isValidUser){
             //console.log('user count updated successfully');
          }else{
             writeViolationStats({ userId, username, count, rank : 'Newbie'})  
          }
      }
    }
 
    private onPresenceUpdate() {
      this.client.on('presenceUpdate', async (oldPresence: Presence | null, newPresence : Presence) => {
        try {
          if (newPresence.user?.bot || !newPresence.activities ) return;

          const oldActivity = oldPresence?.activities.find(activity => activity.type === ActivityType.Playing);
          const newActivity = newPresence.activities.find(activity => activity.type === ActivityType.Playing);
  
          if (newActivity && (!oldActivity || newActivity.name !== oldActivity.name ||
              newActivity.timestamps?.start?.getTime() !== oldActivity.timestamps?.start?.getTime())) {
            const { id, username } = newPresence.user || {};
            await this.recordActivity(id, username, newActivity);
        }

        if (oldActivity && (!newActivity || oldActivity.name !== newActivity.name || oldActivity.timestamps?.end)) {
            const { id, username } = oldPresence?.user || {};
            await this.recordActivity(id, username, oldActivity);
        }
  
        } catch (error) {
          console.error('Error during presence update:', error);
        }
      });
    }

    private async recordActivity(userId : string | undefined, username : string | undefined , activity: Activity) {
      try {
          if (!userId || !username) return;

          const { timestamps, name } = activity;
          if (!timestamps || !timestamps.start || timestamps.start.getTime() === Date.now()) return;

          const newPresenceStart = timestamps.start;
          const duration = calculateDuration(newPresenceStart);
          const activities = [{ activityName: name, duration }];

          await writeUserData(parseInt(userId), username, activities);
      } catch (error) {
          console.error('Error recording activity:', error);
      }
    }
  
    private async registerSlashCommands () {
        const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

        const commandFiles = readdirSync(join(__dirname, "..", "commands")).filter(file => file.endsWith(".ts"));

        for (const file of commandFiles) {
          const command = await import(join(__dirname, "..", "commands", file));
          this.slashCommands.push(command.default.data);
          this.slashCommandsMap.set(command.default.data.name, command.default);
        }

        try {
          console.log("Registering slash commands...");
           
          await rest.put(
            Routes.applicationCommands(config.CLIENT_ID), { body: this.slashCommands }
          );
      
          console.log("Successfully registered application (/) commands!");
        } catch (error) {
          console.error(error);
        }
    }

    private async onInteractionCreate() {
      this.client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<any> => {
          if (!interaction.isChatInputCommand()) return;

          const command = this.slashCommandsMap.get(interaction.commandName)
          if (!command) return;

          try {
              command.execute(interaction as ChatInputCommandInteraction);
          } catch (error: any) {
              console.error(error);
          }
      })
   }
}