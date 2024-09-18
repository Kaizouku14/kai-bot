import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder,Permissions } from "discord.js";
import { parseDuration } from "../utils/util";

export default {
   data : new SlashCommandBuilder()
            .setName('do')
            .setDescription('A command to mute/timeout a user.')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option
                  .setName('command')
                  .setDescription('Choose a command.')
                  .setRequired(true)
                  .addChoices(
                    { name: 'mute', value: 'mute' },
                    { name: 'timeout', value: 'timeout'},
                  )
            )
            .addUserOption(option => option
                .setName('user')
                .setDescription('user to mute/timeout')
                .setRequired(true)
            )
            .addStringOption(option => option
                  .setName('duration')
                  .setDescription('Specify the duration for timeout (e.g., "10m" for 10 minutes, "1h" for 1 hour).')
                  .setRequired(true)
            ),
    cooldown: 3,
    permissions : [PermissionFlagsBits.MuteMembers, PermissionFlagsBits.ModerateMembers],
    async execute(interaction : ChatInputCommandInteraction){
       const argsUser = interaction.options.getUser('user');
       const argsCommand = interaction.options.getString('command');
       const argsDuration = interaction.options.getString('duration');

       if(!argsUser){
         await interaction.reply({ content: 'User not found. Please mention a valid user.', ephemeral: true });
         return;
       }

        try{
          const member = await interaction.guild?.members.fetch(argsUser.id);

            if(argsCommand === 'timeout'){
                if (!argsDuration) {
                    await interaction.reply({ content: 'Please provide a valid duration for the timeout.', ephemeral: true });
                    return;
                }

                const durationMs = parseDuration(argsDuration);
                if (!durationMs) {
                    await interaction.reply({ content: 'Invalid duration format. Please use "10m" for 10 minutes, "1h" for 1 hour, etc.', ephemeral: true });
                    return;
                }

                if (member) {
                    await (member).timeout(durationMs);
                    await interaction.reply({ content : `User ${argsUser.username} has been timed out for ${argsDuration}.`});
                } else {
                    await interaction.reply({ content: 'Could not find the member in this guild.', ephemeral: true });
                }   

           } else if (argsCommand === 'mute'){
                if (!member?.voice.channel) {
                    await interaction.reply({ content: 'User is not in a voice channel.', ephemeral: true });
                    return;
                }

                if (!argsDuration) {
                    await interaction.reply({ content: 'Please provide a duration for the timeout.', ephemeral: true });
                    return;
                }
        
                await member?.voice.setMute(true);
                await interaction.reply(`User ${argsUser.username} has been muted.`);

                const durationMs = parseDuration(argsDuration);
                if (!durationMs) {
                    await interaction.reply({ content: 'Invalid duration format. Please use "10m" for 10 minutes, "1h" for 1 hour, etc.', ephemeral: true });
                    return;
                }

                setTimeout(async () => {
                    try {
                        await member?.voice.setMute(false);
                        await interaction.followUp(`User ${argsUser.username} has been unmuted.`);
                    } catch (error) {
                        console.error('Failed to unmute user:', error);
                        await interaction.followUp({ content: `An error occurred while trying to unmute ${argsUser.username}.`, ephemeral: true });
                    }
                }, durationMs);
                
           }else {
              await interaction.reply({ content: 'Invalid command. Please use either "mute" or "timeout".', ephemeral: true });
           }
        
        }catch(error){
            await interaction.reply({ content : `An error Occured, please try again!.`, ephemeral: true});
            console.log(error)
        } 
    }        
}