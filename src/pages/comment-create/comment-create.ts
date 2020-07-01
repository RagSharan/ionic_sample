import { Component, OnInit } from '@angular/core';
import { NavController, ViewController, LoadingController, NavParams, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl} from '@angular/forms';

import { IComment, IUser } from '../../providers/interfaces';
import { UserService } from '../../providers/services/user.service';
import { DataService } from '../../providers/services/data.service';

@Component({
    templateUrl: 'comment-create.html'
})
export class CommentCreatePage implements OnInit {

    createCommentForm: FormGroup;
    comment: AbstractControl;
    threadKey: string;
    userKey: string;
    loaded: boolean = false;

    constructor(public nav: NavController,
        public navParams: NavParams,
        public loadingCtrl: LoadingController,
        public viewCtrl: ViewController,
        public toastCtrl: ToastController,
        public fb: FormBuilder,
        public userService: UserService,
        public dataService: DataService) {

    }

    ngOnInit() {
        this.threadKey = this.navParams.get('threadKey');
        this.userKey = this.navParams.get('userKey');
        this.createCommentForm = this.fb.group({
            'comment': ['', Validators.compose([Validators.required, Validators.minLength(10)])]
        });

        this.comment = this.createCommentForm.controls['comment'];
        this.loaded = true;
    }

    cancelNewComment() {
        this.viewCtrl.dismiss();
    }

    onSubmit(commentForm: any): void {
        var self = this;
        if (this.createCommentForm.valid) {
            let loader = this.loadingCtrl.create({
                content: 'Posting comment...',
                dismissOnPageChange: true
            });

            loader.present();
            let uid = self.userService.getLoggedInUser().uid;
            self.userService.getUsername(uid, (snapshot) => {
                let username = snapshot.val();
                    let user: IUser = { uid: uid, username: username};
                    let newComment: IComment = {
                        key: null,
                        commentText: commentForm.comment,
                        thread: self.threadKey,
                        user: user,
                        dateCreated: new Date().toString(),
                        votesUp: null,
                        votesDown: null
                    };

                    self.dataService.submitComment(self.userKey, self.threadKey, newComment).then(function (snapshot) {
                            loader.dismiss()
                                .then(() => {
                                    self.viewCtrl.dismiss({
                                        comment: newComment,
                                        user: user
                                    });
                                });
                        }).catch(function (error) {
                            // The Promise was rejected.
                            var errorMessage = error.message;
                            console.error(error);
                            loader.dismiss().then(() => {
                                let toast = self.toastCtrl.create({
                                    message: errorMessage,
                                    duration: 4000,
                                    position: 'top'
                                });
                                toast.present();
                            });
                        });
                });
        }
    }
}