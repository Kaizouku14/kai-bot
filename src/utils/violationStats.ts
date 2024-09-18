import { equalTo, get, orderByChild, push, query, ref, update } from "firebase/database";
import db from "../database/connection";

type userProps = {
  userId : string;
  username? : string;
  count : number;
  rank? : string;
}

export const writeViolationStats = async ({ ...params } : userProps) => {
    try{
       await push(ref(db, `violations`), { ...params });
    }catch(error : any){
     console.error('Error validating user:', error.message);
    }
}

export const checkRecord = async ({ ...params }: userProps) => {
   try{
      const userRef = ref(db, `violations`);
      const userQuery = query(userRef, orderByChild('userId'), equalTo(params.userId));

      const snapshotData = await get(userQuery);

      if(snapshotData.exists()){
        const userData = snapshotData.val();
        const userKey = Object.keys(userData)[0]; // Get the first key (user ID)
        const currentCount = userData[userKey].count || 0; 
        const totalCount = currentCount + params.count; 

        return await updateUserData(params.userId, totalCount);
      }else{
        return false;
      }
   }catch(error : any){
        console.error('Error validating user:', error.message);
        return false;
   }
}

const updateRank = async (userId : string, newRank : string) => {
    return await updateUserField(userId, 'rank', newRank);
};

const updateUserData = async (userId : string , newCount : number) => {
    return await updateUserField(userId, 'count', newCount);
};

const updateUserField = async (userId : string, field : string, value : number | string) => {
    const userRef = ref(db, 'violations');

    try {
        const userQuery = query(userRef, orderByChild('userId'), equalTo(userId));
        const snapshot = await get(userQuery);

        if (snapshot.exists()) {
            const userKey = Object.keys(snapshot.val())[0];
            const specificUserRef = ref(db, `users/${userKey}`);
            await update(specificUserRef, { [field]: value });

            return true;
        } else {
            console.error('User not found');
        }
    } catch (error : any) {
        console.error('Error updating user data:', error.message);
    }
};

