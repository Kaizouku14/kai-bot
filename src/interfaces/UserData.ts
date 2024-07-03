export interface Duration {
    days : number;
    hours : number;
    minutes : number;
    seconds : number;
}

export interface UserData {
    userId : number;
    username : string;
    activity : {
        activityName : string;
        duration: Duration;
    }[];
}
