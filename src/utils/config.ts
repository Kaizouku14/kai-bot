import { Config } from "../interfaces/config"

require('dotenv').config()

let config : Config = {
    DISCORD_TOKEN : process.env.DISCORD_TOKEN!,
    CLIENT_ID : process.env.CLIENT_ID!,
    PORT : process.env.PORT ? parseInt(process.env.PORT) : 3000
}

export default config
