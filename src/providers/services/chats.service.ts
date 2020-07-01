import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { UserService } from './user.service';

@Injectable()
export class ChatsService {

    messageRef: any = firebase.database().ref('/messages');
    messagesPerUser: any = firebase.database().ref('/messagesPerUser');
    messageArray: Array< any > =[];
    constructor(public db: AngularFireDatabase, public up: UserService) { }

    addMessage(messageObj: any) {
        var newMsgRef = this.messageRef.push();
        var messageKey = newMsgRef.key;
        newMsgRef.set({
            'messagekey': messageKey,
            'message': messageObj.message,
            'sender': messageObj.sender,
            'receiver': messageObj.receiver
        }).then(() => {
            this.setMessagePerUser(messageKey, messageObj.sender, messageObj.receiver)
            })
    }
    setMessagePerUser(msgKey: string, sender: string, receiver: string) {
        let conversationId;
        if (sender < receiver) {
             conversationId = sender + ':' + receiver;       
        } else {
            conversationId = receiver + ':' + sender;           
        }
        this.messagesPerUser.child(conversationId + '/' + msgKey).set(true);
    }

    addGroupMessage(messageObj: any, receiver: any) {
        var newMsgRef = this.messageRef.push();
        var messageKey = newMsgRef.key;
        newMsgRef.set({
            'messagekey': messageKey,
            'message': messageObj.message,
            'sender': messageObj.sender,
            'receiver': 'group'
        }).then(() => {
            receiver.forEach((data) => {
                this.setMessagePerUser(messageKey, messageObj.sender, data)
            })
           
        })
    }

    getMessages(sender: string, receiver: string, count: number, cb) {
        let conversationId;
        if (sender < receiver) {
            conversationId = sender + ':' + receiver;
        } else {
            conversationId = receiver + ':' + sender;
        }
        var self = this;
        self.messageArray.length = 0;
        this.messagesPerUser.child(conversationId).limitToLast(count).on('child_added', snap => {
            let msgRef = self.messageRef.child(snap.key);
            msgRef.once('value', cb);
        })
    }

    // get list of Chats of a Logged In User
/*    getChats() {
        return this.up.getUid().then(uid => {
            let chats = this.db.list(`/users/${uid}/chats`);
            return chats;
        });
    }

    // Add Chat References to Both users
    addChats(uid, interlocutor) {
        // First User
        let endpoint = this.db.object(`/users/${uid}/chats/${interlocutor}`);
        endpoint.set(true);

        // Second User
        let endpoint2 = this.db.object(`/users/${interlocutor}/chats/${uid}`);
        endpoint2.set(true);
    }

    getChatRef(uid, interlocutor) {
        let firstRef = this.db.object(`/chats/${uid},${interlocutor}`, { preserveSnapshot: true });
        let promise = new Promise((resolve, reject) => {
            firstRef.subscribe(snapshot => {
                let a = snapshot.exists();
                if (a) {
                    resolve(`/chats/${uid},${interlocutor}`);
                } else {
                    let secondRef = this.db.object(`/chats/${interlocutor},${uid}`, { preserveSnapshot: true });
                    secondRef.subscribe(snapshot => {
                        let b = snapshot.exists();
                        if (!b) {
                            this.addChats(uid, interlocutor);
                        }
                    });
                    resolve(`/chats/${interlocutor},${uid}`);
                }
            });
        });

        return promise;
    }*/
}

