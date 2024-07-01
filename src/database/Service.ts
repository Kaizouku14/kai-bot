const { ref , 
push,
get , 
update, 
query , 
orderByChild,
equalTo } = require("firebase/database");
import db from './connection';
import { UserData } from '../interfaces/UserData';
    
export const writeUserData = async (userId: string, username: string, activity: string, time: string):
 Promise<void> => {
  try {
    const data: UserData = { userId, username, activity, time };

    const validateActivity = await checkActivity(data.userId);
    if(validateActivity){

    }else{
      console.log(data)
      await push(ref(db, 'players'), data);
    }

  } catch (error) {
    console.error('Error writing data:', error);
  }
};

const checkActivity = async (userId : string): Promise<boolean> =>{
  const userRef = ref(db, `users`);

  try {
    const userQuery = query(userRef, orderByChild('userId'), equalTo(userId));
    const snapshot = await get(userQuery);

    if (snapshot.exists()) {
     

    } else {
        console.log('User not found');
        return false;
    }
  } catch (error) {
      console.error('Error validating user:', error.message);
  }

  return false;
}
  
