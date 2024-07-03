import { ref, push, get, update, query, orderByChild, equalTo } from "firebase/database";
import db from './connection';
import { Duration, UserData } from '../interfaces/UserData';
import { addDurations } from "../utils/util";

export const writeUserData = async (userId: string, username: string, activities: { activityName : string, duration: Duration}[]):
    Promise<void> => {
  try {
        const data: UserData = {
          userId,
          username,
          activity: activities
      };

      const isValidUser = await validateUser(userId, activities);

      if (isValidUser) {
          // Update existing data or handle accordingly
          console.log("User Activity Updated SuccessFully!");
      } else {
          await push(ref(db, `activities`), data);
          console.log(`user activity successfully added`);
      }
  } catch (error) {
      console.error('Error writing data:', error);
  }
};

// Function to check if user exists and validate activity
const validateUser = async (userId: string , newActivities: { activityName : string, duration: Duration}[] ): Promise<boolean> => {
    const userRef = ref(db, `activities`);
    try {
        const userQuery = query(userRef, orderByChild('userId'), equalTo(userId));
        const snapshot = await get(userQuery);

        if (snapshot.exists()) {
            const userData = snapshot.val();
            const userKey = Object.keys(userData)[0];
            const existingUserData = userData[userKey] as UserData;

            // Update user's activity duration
            for (const newActivity of newActivities) {
                const existingActivity = existingUserData.activity.find(activity => activity.activityName === newActivity.activityName);
                if (existingActivity) {
                    existingActivity.duration = addDurations(existingActivity.duration, newActivity.duration);
                } else {
                    existingUserData.activity.push(newActivity);
                }
            }

            // Write updated data back to the database
            await update(ref(db, `activities/${userKey}`), existingUserData);

            return true;
        } else {
            console.log('User not found');
            return false;
        }
    } catch (error: any) {
        console.error('Error validating user:', error.message);
        return false;
    }
};