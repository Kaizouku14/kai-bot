export interface Duration {
    days : number;
    hours : number;
    minutes : number;
    seconds : number;
}

export interface UserData {
    userId : string;
    username : string;
    activity : {
        activityName : string;
        duration: Duration;
    }[];
}
