import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder} from "discord.js";
import { getAllUserActivity, getSpecificUserActivity } from "../database/Service";
import { UserData, Duration } from "../interfaces/UserData";

function formatDuration(duration: Duration): string {
    const parts: string[] = []; 
    if (duration.days > 0) parts.push(`${duration.days} days`);
    if (duration.hours > 0) parts.push(`${duration.hours} hrs`);
    if (duration.minutes > 0) parts.push(`${duration.minutes} mins`);
    if (duration.seconds > 0) parts.push(`${duration.seconds} secs`);
    return parts.join(', ') || '0 seconds';
}

export default {
    data : new SlashCommandBuilder()
               .setName("view_statistics")
               .setDescription('Display All Games Played and Their Statistics')
               .addUserOption((option) => option
                    .setName("user")
                    .setDescription("The user to view")
                    .setRequired(true)
                )
                .addStringOption((option) => option
                    .setName("activity")
                    .setDescription("The activity to view") 
                    .setRequired(false)
                 ),
    cooldown : 3,
    async execute(interaction : ChatInputCommandInteraction) {
        try {
            const argsUser = interaction.options.getUser('user');
            const argsActivity = interaction.options.getString('activity');
    
        if (argsUser) {
            const userId = parseInt(argsUser.id);
            let data: UserData | { activityName: string; duration: Duration; } | null;

            if (!argsActivity) {           
                data = await getAllUserActivity(userId);
            } else {
                data = await getSpecificUserActivity(userId, argsActivity);
            }

            if (!data) {
                return interaction.reply({ content: 'No activity found'});
            }

            let description = '```\nActivity Name                 Time Spent\n\n';

            const addActivityToDescription = (activity: { activityName: string; duration: Duration }) => {
                if (activity.duration.days === 0 && activity.duration.hours === 0 && activity.duration.minutes === 0 && activity.duration.seconds === 0) {
                    return;
                }
                let name = activity.activityName.slice(0, 20).padEnd(30, ' ');
                const timeSpent = formatDuration(activity.duration).padStart(20, ' ');
                description += `${name}${timeSpent}\n`;
            };

            if ('activity' in data) {
                data.activity.forEach(addActivityToDescription);
            } else {
                addActivityToDescription(data);
            }
            description += '```';

            const embed = new EmbedBuilder()
                .setTitle(`Activity Statistics for ${argsUser.username}`)
                .setDescription(description)
                .setColor("#00FF00");

            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply({ content: "User not found"});
        }
        
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
        }
    }           
}