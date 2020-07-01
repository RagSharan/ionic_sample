//import { FirebaseListObservable } from 'angularfire2/database';

export interface IThread {
    key: string;
    selectedGroup: string;
    topic: string;
    question: string;
    subject: string;
    dateCreated: string;
    user: IUser;
    reviewDate: string;
}

export interface IComment {
    key?: string;
    thread: string;
    commentText: string;
    user: IUser;
    dateCreated: string;
    votesUp: number;
    votesDown: number;
}

export interface IMessage {
    msgKey: string;
    topic: string;
    messageText: string;
    user: IUser;
    dateCreated: string;

}
export interface IEvent {
    evntKey: string;
    selectedGroups: string;
    title: string;
    user: IUser;
    dateCreated: string;
    location: string;
    startTime: string;
    endTime: string;
   
}
export interface UserCredentials {
    email: string;
    password: string;
}

export interface IUser {
    uid: string;
    username: string;
}

export interface Predicate<T> {
    (item: T): boolean;
}

export interface ValidationResult {
    [key: string]: boolean;
}

export interface IGroups{
    groupName: string;
    createdby: string;
    about: string;
    dateCreated: string;
    selectedUser: Array<string> ;
}