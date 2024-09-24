import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { addUserBirthDate } from "../utils/birthdate";

export default {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('Register a user\'s birthday')
        .addUserOption(option => option
        .setName('member')
        .setDescription('Select the user to register')
        .setRequired(true)
        )
        .addStringOption(option => option
        .setName('birthdate')
        .setDescription('Enter the user\'s birthdate (MM/DD/YYYY) i.e (06/14/2004)')
        .setRequired(true)
        ),
    cooldown : 3,
    async execute(interaction : ChatInputCommandInteraction){
      const argsUser = interaction.options.getUser('member');
      const argsBirthDate = interaction.options.getString('birthdate');

      if(!argsUser){
        return await interaction.reply({ content: 'User not found. Please mention a valid user.', ephemeral: true });
      }
      
      const birthdateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
      if(!argsBirthDate || !argsBirthDate.match(birthdateRegex)){
        return await interaction.reply({ content : 'Please enter a valid birthdate!', ephemeral : true });
      }

      const response =  await addUserBirthDate(argsUser.id, argsUser.username, argsBirthDate);   
      await interaction.reply({ content : response, ephemeral : true});
    }
}