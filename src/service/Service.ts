const { ref , 
push,
get , 
update, 
query , 
orderByChild,
equalTo } = require("firebase/database");
import db from '../database/connection';
    
const writeUserData = async (userId, username, activityName, time) => {
    try {
        await push(ref(db, 'players'), {
           
        });
    } catch (error) {
        console.error('Error writing data:', error);
    }
}
    