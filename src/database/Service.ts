import { ref, push, get, update, query, orderByChild, equalTo } from "firebase/database";
import db from './connection';
import { Duration, UserData } from '../interfaces/UserData';

export const writeUserData = async (userId: string, username: string, activities: { activityName : string, duration: Duration}[]):
    Promise<void> => {
  try {
        const data: UserData = {
          userId,
          username,
          activity: activities
      };

      const isValidActivity = await validateUser(userId);
      if (isValidActivity) {
          // Update existing data or handle accordingly
          console.log('hello')
      } else {
          await push(ref(db, `activities`), data);
          console.log(`user activity successfully added`)
      }
  } catch (error) {
      console.error('Error writing data:', error);
  }
};

// Function to check if user exists and validate activity
const validateUser = async (userId: string): Promise<boolean> => {
  const userRef = ref(db, `activities`);
  try {
      const userQuery = query(userRef, orderByChild('userId'), equalTo(userId));
      const snapshot = await get(userQuery);

      if (snapshot.exists()) {
          const userData = snapshot.val();
          const userKey = Object.keys(userData)[0];
          // Perform validation or return true based on your logic


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