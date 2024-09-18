import { ref, push, get, update, query, orderByChild, equalTo } from "firebase/database";
import db from '../database/connection';
import { Duration, UserData } from '../interfaces/UserData';
import { addDurations } from "../utils/util";

export const writeUserData = async (userId: number, username: string, activities: { activityName : string, duration: Duration}[]):
    Promise<void> => {
  try {
        const data: UserData = {
          userId,
          username,
          activity: activities
      };

      const isValidUser = await validateUser(userId, activities);

      if (isValidUser) {
          console.log("User Activity Updated SuccessFully!");
      } else {
          await push(ref(db, `activities`), data);
          console.log(`user activity successfully added`);
      }

  } catch (error) {
      console.error('Error writing data:', error);
  }
};

const fetchUserData = async (userId: number): Promise<{ key: string, data: UserData } | null> => {
    const userRef = ref(db, 'activities');
    const userQuery = query(userRef, orderByChild('userId'), equalTo(userId));
    const snapshot = await get(userQuery);

    if (snapshot.exists()) {
        const userData = snapshot.val();
        const userKey = Object.keys(userData)[0];
        return { key: userKey, data: userData[userKey] as UserData };
    } else {
        console.log(`No activities found for user ID: ${userId}`);
        return null;
    }
};

export const validateUser = async (userId: number, newActivities: { activityName: string, duration: Duration }[]): Promise<boolean> => {
    try {
        const userRecord = await fetchUserData(userId);

        if (userRecord) {
            const { key, data: existingUserData } = userRecord;

            for (const newActivity of newActivities) {
                const existingActivity = existingUserData.activity.find(activity => activity.activityName === newActivity.activityName);
                if (existingActivity) {
                    existingActivity.duration = addDurations(existingActivity.duration, newActivity.duration);
                } else {
                    existingUserData.activity.push(newActivity);
                }
            }

            await update(ref(db, `activities/${key}`), existingUserData);
            return true;
        } else {
            return false;
        }
    } catch (error: any) {
        console.error('Error validating user:', error.message);
        return false;
    }
};

export const getAllUserActivity = async (userId: number): Promise<UserData | null> => {
    try {
        const userRecord = await fetchUserData(userId);

        if (userRecord) {
            return userRecord.data;
        } else {
            return null;
        }
    } catch (error: any) {
        console.error('Error fetching user activity:', error.message);
        return null;
    }
};

export const getSpecificUserActivity = async (userId: number, activityName: string):
          Promise<{ activityName: string, duration: Duration } | null> => {
    try {
        const userRecord = await fetchUserData(userId);

        if (userRecord) {
            const activity = userRecord.data.activity.find(activity => activity.activityName === activityName);
            if (activity) {
                return activity;
            } else {
                console.log(`Activity ${activityName} not found for user ID: ${userId}`);
                return null;
            }
        } else {
            return null;
        }
    } catch (error: any) {
        console.error('Error fetching specific activity:', error.message);
        return null;
    }
};
