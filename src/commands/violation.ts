import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { retrieveAll, retrieveCount } from "../utils/violationStats";

export default {
    data : new SlashCommandBuilder()
        .setName("violators")
        .setDescription('violators in this server')
        .addStringOption(option => option
            .setName('command')
            .setDescription('Choose a command.')
            .setRequired(true)
            .addChoices(
              { name: 'view_violation', value: 'user'},
              { name: 'view_leaderboard', value: 'leaderboard'},
            )
         )
        .addUserOption(option => option
            .setName('user')
            .setDescription('Display the Statistics of this racist')
            .setRequired(false)
        ),

    cooldown : 3,
    permissions : [],
    async execute(interaction : ChatInputCommandInteraction) {
      try{
        const argsCommand = interaction.options.getString('command');
        const argsUser = interaction.options.getUser('user');

        if(argsCommand === 'user'){
            const result = await retrieveCount(argsUser?.id || interaction.user.id);

            if(result.count > 0){
                const embed = new EmbedBuilder()
                .setTitle('🎉 Achievement 🎉')
                .setColor('#0099ff')
                .setDescription(`Hey ${argsUser}, you've already mentioned **nigga/nigger**: \`${result.count} times!\` Keep it up!\n
                    Milestone rank : \`${result.rank}\``);
    
               await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply(` \`Hey\` ${interaction.user}, \`You do not have an achievement 😔.\` `);
            }

        }else if(argsCommand === 'leaderboard'){

            let leaderBoard = await retrieveAll();
            leaderBoard.sort((a: { count: number; }, b: { count: number; }) => b.count - a.count);

            if (leaderBoard.length > 0) {
                let description = '```\nTop Niggers           No. of N word said\n';
                    leaderBoard.forEach((value: { username: string; count: any; }, index: number) => {
                        const position = `${index + 1}.`.padEnd(3, ' ');
                        let name = value.username.slice(0, 15).padEnd(15, ' ');
                        if (index === 0) name = `🥇 ${name}`;
                        if (index === 1) name = `🥈 ${name}`;
                        if (index === 2) name = `🥉 ${name}`;
                        const count = String(value.count).padStart(25 - name.length, ' ');
                        description += `${position}${name}${count}\n`;
                    });
                    description += '```';

                const embed = new EmbedBuilder()
                    .setTitle('Leader Board')
                    .setColor('#0099ff')
                    .setDescription(description);

                await interaction.reply({ embeds: [embed] }); 
            } else {
                await interaction.reply('`No record yet.`');
            }
        }

      }catch(error : any){
        console.error(error);
        await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
      }
    }
}