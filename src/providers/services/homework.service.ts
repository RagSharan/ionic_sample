import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import firebase from 'firebase';
import { IThread, IComment } from '../interfaces';
import { UserService } from './user.service';
//declare var firebase: any;

@Injectable()
export class HomeworkService {
    
    usersRef: any = firebase.database().ref('users');
    groupRef: any = firebase.database().ref('groupsPerUser')
    assignmentRef: any = firebase.database().ref('assignment');
    commentsRef: any = firebase.database().ref('comments');
    
    storageRef: any = firebase.storage().ref();
    connectionRef: any = firebase.database().ref('.info/connected');

    defaultImageUrl: string;
    connected: boolean = false;
    groupArray: Array<any> = [];
    assignmentArray: Array<any> = [];

    constructor(public userService: UserService) {
        
    }

    createAssignment(thread: IThread) {
        var newAssignmentRef = this.assignmentRef.push();
        var assignmentkey = newAssignmentRef.key;

      /* return newAssignmentRef.set({
            'key': assignmentkey,
            'selectedGroup': thread.selectedGroup,
            'topic': thread.topic,
            'question': thread.question,
            'subject': thread.subject,
            'dateCreated': new Date().toString(),
            'userId': thread.userId,
            'comments': 0
        }).then(() => {
            console.log('new Assignment created');
        })*/
    }
    getUserAssignment(cb) {
        let userId = this.userService.getLoggedInUser().uid;
        let usertype: string = this.userService.getUsertype(userId);
        var self = this;
        if (usertype === 'parents') {

            this.groupRef.child(userId).on('child_added', snap => {
                let assignment = self.assignmentRef.orderByChild('selectedGroup').equalTo(snap.key);
                assignment.once('value', cb);
            })
        }
        else {
            return this.assignmentRef.orderByChild('userId').equalTo(userId).once('value');
        }

    }
        
    getDefaultImageUrl() {
        return this.defaultImageUrl;
    }

    getCommentsRef() {
        return this.commentsRef;
    }

    getUsersRef() {
        return this.usersRef;
    }

    getStorageRef() {
        return this.storageRef;
    }

    getThreadCommentsRef(threadKey: string) {
        return this.commentsRef.orderByChild('homework').equalTo(threadKey);
    }

    loadThreads() {
        return this.assignmentRef.once('value');
    }
    
    addThreadToFavorites(userKey: string, threadKey: string) {
        return this.usersRef.child(userKey + '/favorites/' + threadKey).set(true);
    }

    getFavoriteThreads(user: string) {
        return this.usersRef.child(user + '/favorites/').once('value');
    }

    setUserImage(uid: string) {
        this.usersRef.child(uid).update({
            image: true
        });
    }

    loadComments(threadKey: string) {
        return this.commentsRef.orderByChild('thread').equalTo(threadKey).once('value');
    }

    submitComment(threadKey: string, comment: IComment) {


        this.commentsRef.child(comment.key).set({
            key: comment.key,
            thread: comment.thread,
            commentText: comment.commentText,
            user: comment.user,
            dateCreated: comment.dateCreated,
            votesUp: comment.votesUp,
            votesDown: comment.votesDown

        });

        return this.assignmentRef.child(threadKey + '/comments').once('value')
            .then((snapshot) => {
                let numberOfComments = snapshot == null ? 0 : snapshot.val();
                this.assignmentRef.child(threadKey + '/comments').set(numberOfComments + 1);
            });
    }

    voteComment(commentKey: string, like: boolean, user: string): any {
        let commentRef = this.commentsRef.child(commentKey + '/votes/' + user);
        return commentRef.set(like);
    }

    

    getUserThreads(userUid: string) {
        return this.assignmentRef.orderByChild('user/uid').equalTo(userUid).once('value');
    }

    getUserComments(userUid: string) {
        return this.commentsRef.orderByChild('user/uid').equalTo(userUid).once('value');
    }

    

}