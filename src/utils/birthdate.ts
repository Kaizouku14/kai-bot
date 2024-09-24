import { equalTo, get, orderByChild, push, query, ref, update } from 'firebase/database';
import db from '../database/connection';


interface birthdate {
    id : string,
    user : string,
    date : string,
    greeted : boolean
}

export const addUserBirthDate = async (id : string, user : string, date : string) => {
    const birthdateRef = ref(db, `birthdate`);

   try{
    const userQuery = query(birthdateRef, orderByChild('id'), equalTo(id));
    const snapshot = await get(userQuery);

    if (snapshot.exists()) {
      return "User already exists." ;
    }

    const data = { id, user, date , greeted : false};
    await push(ref(db, `birthdate`), data);
    return "User birthdate added successfully.";

   }catch(error : any){
    console.error('Error writing data:', error);    
   }
}


const getAllUserBirthDate = async (): Promise<birthdate[] | undefined> => {
    const usersRef = ref(db, 'birthdate');
    const usersQuery = query(usersRef, orderByChild('date'));

    try{
        const snapshot = await get(usersQuery);
        if (snapshot.exists()) {     
            const usersData: any = [];

            snapshot.forEach(userSnapshot => {
                usersData.push({ id: userSnapshot.key, ...userSnapshot.val() });
            });
          return usersData;
        }

    }catch(error : any){
        console.error('Error reading data:', error);    
    } 
}

export const checkTodayBirthdays = async (): Promise<{ id: string; date: string }[]> => {
    const usersData: birthdate[] | undefined = await getAllUserBirthDate();
    if (!usersData) return [];

    const today = new Date();
    const todayFormatted = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    // Find users whose birthdate matches today (MM/DD) and haven't been greeted
    const birthdayUsers = usersData.filter(user => {
        if (!user.date) {
            console.warn(`User with ID ${user.id} has no date.`);
            return false; 
        }
        
        const birthDateFormatted = user.date.slice(0, 5); // Get only MM/DD from the birthdate
        return birthDateFormatted === todayFormatted && !user.greeted; 
    });

    await Promise.all(birthdayUsers.map(user => updateUserData(user.id)));

    return birthdayUsers.map(user => ({ id: user.id, date: user.date }));
};

const updateUserData = async (id: string) => {
    const userRef = ref(db, 'birthdate');
    const userQuery = query(userRef, orderByChild('id'), equalTo(id));
    const snapshot = await get(userQuery);

    if (snapshot.exists()) {
        const userKey = Object.keys(snapshot.val())[0];
        const specificUserRef = ref(db, `birthdate/${userKey}`); 
        await update(specificUserRef, { greeted: true });
    } else {
        console.log('User not found');
    }
};
