import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ViewController, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { FirebaseListObservable } from 'angularfire2/database';

import { UserService } from '../../providers/services/user.service';
import { ScheduleEventService } from '../../providers/services/scheduleEvent.service';
import { IEvent } from '../../providers/interfaces';
import { IUser } from '../../providers/interfaces';
import * as moment from 'moment';

@Component({
    selector: 'events',
    templateUrl: 'create-events.html'
})
export class CreateEventPage implements OnInit {

    minDate = new Date().toISOString();
    public selectedName: string;
    user: IUser;
    eventsForm: FormGroup;
    title: AbstractControl;
    startTime: AbstractControl;
    endTime: AbstractControl;
    location: AbstractControl;
  
    userGrouplist: FirebaseListObservable<any[]>;
    groupname: string;
    testCheckboxOpen: boolean = false;
    public selectedGroups: string;
    userId: string;  
    
    constructor(public nav: NavController,
        public loadingCtrl: LoadingController,
        public viewCtrl: ViewController,
        public alertCtrl: AlertController,
        public fb: FormBuilder,
        public toastCtrl: ToastController,
        public userService: UserService,
        private navParams: NavParams,
        public eventsService: ScheduleEventService) {

        let preselectedDate = moment(this.navParams.get('selectedDay')).format();
      //  this.eventForm.startTime = preselectedDate;
        //this.endTime = preselectedDate;
        console.log("min date=" + preselectedDate);
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad CreateEventsPage');
    }

    ngOnInit() {
        this.userId = this.userService.getLoggedInUser().uid;
        this.eventsForm = this.fb.group({
            'title': ['', Validators.compose([Validators.required])],
            'startTime': ['', Validators.compose([Validators.required])],
            'endTime': ['', Validators.compose([Validators.required])],
            'location': ['', Validators.compose([Validators.required])],
        });

        this.title = this.eventsForm.controls['title'];
        this.startTime = this.eventsForm.controls['startTime'];
        this.endTime = this.eventsForm.controls['endTime'];
        this.location = this.eventsForm.controls['location'];
       
    }

    

    onSubmit(thread: any): void {
        var self = this;
        if (this.eventsForm.valid) {

            let loader = this.loadingCtrl.create({
                content: 'Event Scheduled Successfully..',
                dismissOnPageChange: true
            });

            loader.present();
            let uid = self.userService.getLoggedInUser().uid;
            self.userService.getUsername(uid, (snapshot) => {
                let username = snapshot.val();
               
                        let newEvents: IEvent = {
                            evntKey: null,
                            selectedGroups: self.selectedGroups,
                            title: thread.title,
                            location: thread.location,
                            user: { uid: uid, username: username },
                            dateCreated: new Date().toString(),
                            startTime: thread.startTime.toString(),
                            endTime: thread.endTime.toString()
                        };
                        self.eventsService.scheduleEvent(newEvents).then(function (snapshot) {
                            loader.dismiss().then(() => { 
                                        self.viewCtrl.dismiss(newEvents);
                                    });
                        })

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

    close() {
        this.viewCtrl.dismiss();
    }

    selectGroup() {
        this.userGrouplist = this.userService.getAdminGroupList();
        let alert = this.alertCtrl.create();
        alert.setTitle('select user group');

        this.userGrouplist.subscribe((elements) => {
            for (let element of elements) {
                this.groupname = element.groupName;
                let groupkey: string = element.$key;

                alert.addInput({
                    type: 'radio',
                    label: this.groupname,
                    value: groupkey,

                });
            }
        })
        alert.addInput({
            type: 'radio',
            label: 'Create Event for self Remainder',
            value: 'personalEvent',
            checked: false
        });

        alert.addButton('Cancel');
        alert.addButton({
            text: 'Okay',
            handler: data => {
                console.log('Checkbox data:', data);
                this.testCheckboxOpen = false;
                this.selectedGroups = data;
                this.setSelectedName(data);
                console.log("selected groups=" + this.selectedGroups);
            }
        });
        alert.present().then(() => {
            this.testCheckboxOpen = true;
        });
    }

    setSelectedName(data: string) {
        if (data === 'personalEvent') {
            this.selectedName = 'Create Event for self Remainder';
            this.selectedGroups = this.userId;
        } else {
            this.userService.getGroupName(data).then(snap => {
                this.selectedName = snap.val();
            })
        }
    }

}