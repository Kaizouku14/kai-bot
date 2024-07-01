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
  Activity
} from "discord.js";
import { Command } from "../interfaces/command";
import { readdirSync } from "fs";
import { join } from "path";
import keepAlive from "../utils/keepAlive";
import config from "../utils/config";
import { writeUserData } from "../database/Service";

export class Bot {
    public slashCommands = new Array<ApplicationCommandDataResolvable>();
    public slashCommandsMap = new Collection<string, Command>();

    public constructor (public readonly client : Client){ 
        this.client.login(config.DISCORD_TOKEN);

        this.client.once('ready', client => {
            console.log(`Ready! Logged in as ${client.user?.tag}`);
                   
            keepAlive({ port : config.PORT });
         // this.registerSlashCommands();
        })

        this.client.on("warn", (info) => console.log(info));
        this.client.on("error", console.error);

        this.onPresenceUpdate()
      // this.onInteractionCreate();
    }

    private onPresenceUpdate() {
      this.client.on('presenceUpdate', async (oldPresence: Presence | null, newPresence: Presence) => {
        try {
          if (oldPresence?.user?.bot || newPresence?.user?.bot) return;
  
          const oldActivity = oldPresence?.activities.find(activity => activity.type === ActivityType.Playing);
          const newActivity = newPresence?.activities.find(activity => activity.type === ActivityType.Playing);
  
          if (newActivity) {
            console.log("New presence detected");
            await this.recordActivity(newPresence, newActivity);
          }
  
          if (oldActivity) {
            console.log("Old presence detected");
            await this.recordActivity(oldPresence, oldActivity);
          }
        } catch (error) {
          console.error('Error during presence update:', error);
        }
      });
    }

    private async recordActivity(presence: Presence | null, activity: Activity) {
      if (!presence) return;
  
      const { user, activities } = presence;
      const userId = user?.id;
      const username = user?.username;
      const timestamps = activities.map((activity) => activity.timestamps);
      const start = timestamps[0]?.start;
  
      if (userId && username && start) {
        await writeUserData(userId, username, activity.name, start.toISOString());
      } else {
        console.error('Missing data for user activity:', { userId, username, start });
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