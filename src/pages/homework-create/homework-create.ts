import { Component, OnInit } from '@angular/core';
import { NavController, ViewController, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UserService } from '../../providers/services/user.service';
import { DataService } from '../../providers/services/data.service';
import { IThread } from '../../providers/interfaces';
import { IUser } from '../../providers/interfaces';


@Component({
    selector: 'homework-create',
    templateUrl: 'homework-create.html'
})
export class HomeworkCreate implements OnInit {
    
    user: IUser;
    userGroups: Array<any> = [];
    
    testCheckboxOpen: boolean = false;
    public selectedGroup: string;
    public selectedName: string;

    homeworkForm: FormGroup;
    topic: AbstractControl;
    question: AbstractControl;
    subject: AbstractControl;
    reviewDate: AbstractControl;

    constructor(public nav: NavController,
        public loadingCtrl: LoadingController,
        public viewCtrl: ViewController,
        public alertCtrl: AlertController,
        public fb: FormBuilder,
        public toastCtrl: ToastController,
        public userService: UserService,
        public dataService: DataService) {
    
    }



    ionViewDidLoad() {
        console.log('ionViewDidLoad PostHomeworkPage');
    }



    ngOnInit() {
        console.log('in thread create..');
        this.homeworkForm = this.fb.group({
            'topic': ['', Validators.compose([Validators.required])],
            'question': ['', Validators.compose([Validators.required, Validators.minLength(10)])],
            'subject': ['', Validators.compose([Validators.required])],
            'reviewDate': ['', Validators.compose([Validators.required])],
        });

        this.topic = this.homeworkForm.controls['topic'];
        this.question = this.homeworkForm.controls['question'];
        this.subject = this.homeworkForm.controls['subject'];
        this.reviewDate = this.homeworkForm.controls['reviewDate'];
        
    }

    cancelNewThread() {
        this.viewCtrl.dismiss();
    }
   
    selectGroup() {
        let userId = this.userService.getLoggedInUser().uid;
        this.userService.getGroupsPerUser(userId,(snap) => {
            this.userGroups.push(snap.val());
        })
        let alert = this.alertCtrl.create();
        alert.setTitle('select user group');
        
        this.userGroups.forEach((element) => {
            let groupname = element.groupName;
            let groupkey: string = element.key;
            alert.addInput({
                type: 'radio',
                label: groupname,
                value: groupkey,

            });

        })
              
        alert.addInput({
            type: 'radio',
            label: 'Defaul Group',
            value: 'draft',
           checked: false
        });
            
        alert.addButton('Cancel');
        alert.addButton({
            text: 'Okay',
            handler: data => {
                console.log('Checkbox data:', data);
                this.testCheckboxOpen = false;
                this.selectedGroup = data;
                this.setSelectedName(data);
            }
        });
        alert.present().then(() => {
            this.testCheckboxOpen = true;
        });
    }

    setSelectedName(data: string) {
        if (data === 'draft') {
            this.selectedName = 'Draft Homework';
        } else {
            this.userService.getGroupName(data).then(snap => {
                this.selectedName = snap.val();
            })
        }
    }

    onSubmit(thread: any): void {
        var self = this;
        if (this.homeworkForm.valid) {
            let loader = this.loadingCtrl.create({
                content: 'Posting thread...',
                dismissOnPageChange: true
            });
            loader.present();
            let uid = self.userService.getLoggedInUser().uid;
            self.userService.getUsername(uid, (snapshot) => {
                let username = snapshot.val();
                let newThread: IThread = {
                    key: null,
                    selectedGroup: self.selectedGroup,
                    topic: thread.topic,
                    question: thread.question,
                    subject: thread.subject,
                    user: { uid: uid, username: username },
                    dateCreated: new Date().toString(),
                    reviewDate: thread.reviewDate
                };
                self.dataService.createNewThread(newThread)
                    .then(function (snapshot) {
                        loader.dismiss()
                            .then(() => {
                                self.viewCtrl.dismiss({
                                    thread: newThread,

                                });
                            });
                    });
            }).catch(function (error) {
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
        }
    }    
}
