import { equalTo, get, orderByChild, push, query, ref } from 'firebase/database';
import db from '../database/connection';


interface birthdate {
    id : string,
    user : string,
    date : string
}

export const addUserBirthDate = async (id : string, user : string, date : string) => {
    const birthdateRef = ref(db, `birthdate`);

   try{
    const userQuery = query(birthdateRef, orderByChild('id'), equalTo(id));
    const snapshot = await get(userQuery);

    if (snapshot.exists()) {
      return "User already exists." ;
    }

    const data = { id, user, date };
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

export const checkTodayBirthdays = async (): Promise<{user: string, date: string}[]> => {
    const usersData: birthdate[] | undefined = await getAllUserBirthDate();
    if (!usersData) return [];
  
    // Get today's date in MM/DD format
    const today = new Date();
    const todayFormatted = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
  
    // Find users whose birthdate matches today (MM/DD)
    const birthdayUsers = usersData.filter(user => {
      const birthDateFormatted = user.date.slice(0, 5); // Get only MM/DD from the birthdate
      return birthDateFormatted === todayFormatted;
    });
  
    return birthdayUsers.map(user => ({ user: user.user, date: user.date }));
  };