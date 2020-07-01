import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { IThread, IComment } from '../interfaces';
import { UserService } from './user.service';


@Injectable()
export class DataService {
    databaseRef: any = firebase.database();
    usersRef: any = firebase.database().ref('users');
    homeworkRef: any = firebase.database().ref('homework');
    commentsRef: any = firebase.database().ref('comments');
    statisticsRef: any = firebase.database().ref('statistics');
    storageRef: any = firebase.storage().ref();
    connectionRef: any = firebase.database().ref('.info/connected');
    groupRef: any = firebase.database().ref('groupsPerUser')

    defaultImageUrl: string;
    connected: boolean = false;
    groupArray: Array<any> = [];

    constructor(public userService: UserService) {
        var self = this;
        try {
            self.checkFirebaseConnection();
        } catch (error) {
            console.log('Data Service error:' + error);
        }
    }

    checkFirebaseConnection() {
        try {
            var self = this;
            var connectedRef = self.getConnectionRef();
            connectedRef.on('value', function (snap) {
                console.log(snap.val());
                if (snap.val() === true) {
                    console.log('Firebase: Connected:');
                    self.connected = true;
                } else {
                    console.log('Firebase: No connection:');
                    self.connected = false;
                }
            });
        } catch (error) {
            self.connected = false;
        }
    }

    isFirebaseConnected() {
        return this.connected;
    }


    getDatabaseRef() {
        return this.databaseRef;
    }

    getConnectionRef() {
        return this.connectionRef;
    }

    goOffline() {
        firebase.database().goOffline();
    }

    goOnline() {
        firebase.database().goOnline();
    }

    getDefaultImageUrl() {
        return this.defaultImageUrl;
    }

    getThreadsRef() {
        return this.homeworkRef;
    }
    
    getCommentsRef() {
        return this.commentsRef;
    }
    
    getStorageRef() {
        return this.storageRef;
    }

    getThreadCommentsRef(userKey: string, threadKey: string) {
        return this.commentsRef.child(userKey).orderByChild('thread').equalTo(threadKey);
    }

    loadThreads() {
        return this.homeworkRef.once('value');
    }

    

    setUserImage(uid: string) {
        this.usersRef.child(uid).update({
            image: true
        });
    }
    /*
    loadComments(threadKey: string) {
        return this.commentsRef.child(userKey).orderByChild('thread').equalTo(threadKey).once('value');
    }
    */
    submitComment(userKey: string, threadKey: string, comment: IComment) {
        let newCommentRef = this.commentsRef.push();
        let commentkey: string = newCommentRef.key;

        return this.commentsRef.child(userKey).child(commentkey).set({
                      key: commentkey,
                      thread: comment.thread,
                      commentText: comment.commentText,
                      user: comment.user,
                      dateCreated: comment.dateCreated,
                      votesUp: comment.votesUp,
                      votesDown: comment.votesDown

        });

    }

    voteComment(userKey: string, commentKey: string, like: boolean, user: string): any {
        let commentRef = this.commentsRef.child(userKey).child(commentKey + '/votes/' + user);
        return commentRef.set(like);
    }

    getUserThreads(userUid: string) {
        return this.homeworkRef.orderByChild('user/uid').equalTo(userUid).once('value');
    }
    /*
    getUserComments(userKey: string, userUid: string) {
        return this.commentsRef.child(userKey).orderByChild('user/uid').equalTo(userUid).once('value');
    }
    */
    createNewThread(thread: IThread) {
        var newRef = this.homeworkRef.push();
        var threadkey = newRef.key;

        return newRef.set({
            key: threadkey,
            selectedGroup: thread.selectedGroup,
            topic: thread.topic,
            question: thread.question,
            subject: thread.subject,
            user: thread.user,
            dateCreated: new Date().toString(),
            reviewDate: thread.reviewDate
        }).then(function (dataShapshot) {
            console.log('Add Notification service');
        });
    }
    getHomeWorkByUserId(userId: string, cb) {
        var self = this;
        this.userService.getTypeU(userId, snap => {
            let usertype = snap.val();
            if (usertype === 'student') {
                this.groupRef.child(userId).on('child_added', snap => {
                    let assignment = self.homeworkRef.orderByChild('selectedGroup').equalTo(snap.key);
                    assignment.once('value', cb);
                })
            }
            else {
                let assignment = this.homeworkRef.orderByChild('user/uid').equalTo(userId);
                assignment.once('value', cb);
            }
        });
        
    }
 
    getHomeWorkByGroupId(groupId: string, cb) {
        let assignment = this.homeworkRef.orderByChild('selectedGroup').equalTo(groupId);
        assignment.on('value', cb);
    }

    addThreadToFavorites(userKey: string, threadKey: string) {
        return this.statisticsRef.child('/favorites').child(userKey +'/' + threadKey).set(true);
    }

    getFavoriteThreads(userId: string, cb) {
        var self = this;
        return this.statisticsRef.child('/favorites').child(userId).on('child_added', snap => {
            let assignment = self.homeworkRef.orderByKey().equalTo(snap.key);
            assignment.once('value', cb);
        })
    }

    setHomeworkStatus(userKey: string, threadKey: string, status: string) {
        return this.statisticsRef.child('homework').child(userKey + '/' + threadKey).set(status);
    }
    getHomeworkStatus(userKey: string, threadKey: string, cb) {
        let status = this.statisticsRef.child('homework').child(userKey + '/' + threadKey);
        status.once('value', cb);
    }
    
}