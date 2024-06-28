import { Client, REST, Routes} from "discord.js"
import keepAlive from "../utils/keepAlive"
import config from "../utils/config"

export class Bot {

    public constructor (public readonly client : Client){
        this.client.login(config.DISCORD_TOKEN);

        this.client.once('ready', client => {
            console.log(`Ready! Logged in as ${client.user?.tag}`);
                   
            keepAlive({ port : config.PORT });
            this.registerSlashCommands();
        })

        this.client.on("warn", (info) => console.log(info));
        this.client.on("error", console.error);
    }

    private async registerSlashCommands (){
        const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);
  
        try {
          console.log("Registering slash commands...");
      
          await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: this.commands });
      
          console.log("Successfully registered application (/) commands!");
        } catch (error) {
          console.error(error);
        }
    }

    private commands = [
      {
        name: 'Game statistics',
        description: 'Display All Games Played and Their Statistics',
      },
    ];
}