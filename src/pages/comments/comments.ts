import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, ModalController, ToastController, AlertController, NavParams, Content } from 'ionic-angular';

import { CommentCreatePage } from '../comment-create/comment-create';
import { IComment } from '../../providers/interfaces';
import { UserService } from '../../providers/services/user.service';
import { DataService } from '../../providers/services/data.service';
import { ItemsService } from '../../providers/services/items.service';
import { MappingsService } from '../../providers/services/mappings.service';

@Component({
    templateUrl: 'comments.html'
})
export class CommentsPage implements OnInit {
    @ViewChild(Content) content: Content;
    threadKey: string;
    userKey: string;
    userId: string;
    comments: IComment[];
    status: string;
    flag: boolean;
    student: any;

    constructor(public actionSheeCtrl: ActionSheetController,
        public modalCtrl: ModalController,
        public toastCtrl: ToastController,
        public alertCtrl: AlertController,
        public navParams: NavParams,
        public userService: UserService,
        public itemsService: ItemsService,
        public dataService: DataService,
        public mappingsService: MappingsService) {
       
    }

    ngOnInit() {
        this.userId = this.userService.getLoggedInUser().uid;
        this.threadKey = this.navParams.get('threadKey');
        this.student = this.navParams.get('student');
        this.userKey = this.student.userkey;
        this.loadComments();
        this.getHomeworkStatus();
        this.setFlag();
    }
    setFlag() {
        this.userService.getTypeU(this.userId, snap => {
            if (snap.val() === 'teacher') {
                this.flag = true;
            }
            else {
                this.flag = false;
            }
        });
    }
    loadComments() {
        var self = this;
        self.dataService.getThreadCommentsRef(self.userKey, self.threadKey).once('value', function (snapshot) {
            self.comments = self.itemsService.reversedItems<IComment>(self.mappingsService.getComments(snapshot));

            for (let comment of self.comments) {
                console.log(comment.commentText);
                console.log(comment.dateCreated);
            }

        }, function (error) { });
    }   

    createComment() {
        let self = this;

        let modalPage = this.modalCtrl.create(CommentCreatePage, {
            threadKey: this.threadKey,
            userKey: this.userKey
        });

        modalPage.onDidDismiss((commentData: any) => {
            if (commentData) {
                let commentVals = commentData.comment;
                let commentUser = commentData.user;

                let createdComment: IComment = {
                    key: commentVals.key,
                    thread: commentVals.thread,
                    commentText: commentVals.commentText,
                    user: commentUser,
                    dateCreated: commentVals.dateCreated,
                    votesUp: null,
                    votesDown: null
                };

                self.comments.push(createdComment);
                self.scrollToBottom();

                let toast = this.toastCtrl.create({
                    message: 'Comment created',
                    duration: 2000,
                    position: 'top'
                });
                toast.present();
            }
        });

        modalPage.present();
    }

    scrollToBottom() {
        this.content.scrollToBottom();
    }

    vote(like: boolean, comment: IComment) {
        var self = this;

        self.dataService.voteComment(self.userKey, comment.key, like, self.userId).then(function () {
            self.dataService.getCommentsRef().child(comment.key).once('value').then(function (snapshot) {
                comment = self.mappingsService.getComment(snapshot, comment.key);
                self.itemsService.setItem<IComment>(self.comments, c => c.key === comment.key, comment);
            });
        });
    }

    showCommentActions() {
        var self = this;
        let actionSheet = self.actionSheeCtrl.create({
            title: 'comment Actions',
            buttons: [
                {
                    text: 'Add to favorites',
                    icon: 'heart',
                    handler: () => {
                        self.addThreadToFavorites();
                    }
                },
                {
                    text: 'Cancel',
                    icon: 'close-circle',
                    role: 'cancel',
                    handler: () => { }
                }
            ]
        });

        actionSheet.present();
    }

    addThreadToFavorites() {
        var self = this;
        let currentUser = self.userService.getLoggedInUser();
        if (currentUser != null) {
            self.dataService.addThreadToFavorites(self.userKey, self.threadKey)
                .then(function () {
                    let toast = self.toastCtrl.create({
                        message: 'Added to favorites',
                        duration: 3000,
                        position: 'top'
                    });
                    toast.present();
                });
        } else {
            let toast = self.toastCtrl.create({
                message: 'This action is available only for authenticated users',
                duration: 3000,
                position: 'top'
            });
            toast.present();
        }
    }
    changeStatus() {
        let alert = this.alertCtrl.create();
        alert.setTitle('Change Homework Status');
          alert.addInput({
            type: 'radio',
            label: 'Completed',
            value: 'Completed',
            checked: true
            });
          alert.addInput({
            type: 'radio',
            label: 'Partial Completed',
            value: 'Partial Completed',
            });
          alert.addInput({
            type: 'radio',
            label: 'Incomplete',
            value: 'Incompleted',
            });

        alert.addButton('Cancel');
        alert.addButton({
            text: 'Okay',
            handler: data => {
                this.setSelectedStatus(data);
            }
        });
        alert.present().then(() => {
        });
    }
    setSelectedStatus(statusData: string) {
        this.status = statusData;
        this.dataService.setHomeworkStatus(this.userKey, this.threadKey, this.status).then(() => {
            let toast = this.toastCtrl.create({
                message: 'Homework status updated',
                duration: 2000,
                position: 'top'
            });
            toast.present();
        })
    }

    getHomeworkStatus() {
        var self = this;
        this.dataService.getHomeworkStatus(this.userKey, this.threadKey, snap => {
            self.status = snap.val();
            if (self.status === null) {
                self.status = 'Pending';
            }      
        })
    }
}