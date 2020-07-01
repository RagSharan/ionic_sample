import { Component, OnInit, NgZone } from '@angular/core';
import { IonicPage, NavController, ModalController, AlertController, ToastController } from 'ionic-angular';
import * as moment from 'moment';

import { CreateEventPage } from '../create-event/create-events';
import { ScheduleEventService } from '../../providers/services/scheduleEvent.service';
import { UserService } from '../../providers/services/user.service';
import { MappingsService } from '../../providers/services/mappings.service';
import { ItemsService } from '../../providers/services/items.service';
import { IEvent } from '../../providers/interfaces';


@IonicPage()
@Component({
    selector: 'page-user-calender',
    templateUrl: 'user-calender.html',
})
export class UserCalenderPage implements OnInit {
    public eventsArray: Array<any> = [];
    eventSource = [];
    viewTitle: string;
    selectedDay = new Date();
    userId: string;

    userGroups: Array<any> = [];
    students: Array<any> = [];
    public selectedGroup: string;
    public selectedName: string;
    flag: boolean;
    public filterName: string;
    today: string;


    constructor(public navCtrl: NavController, private modalCtrl: ModalController, private alertCtrl: AlertController,
        public eventService: ScheduleEventService, public toastCtrl: ToastController,
        public userService: UserService, private zone: NgZone,
        public mappingsService: MappingsService,
        public itemsService: ItemsService) {
        this.userId = this.userService.getLoggedInUser().uid;
        this.zone.run(() => {
           // this.getUserScheduleEvents(this.userId);
            this.getUserEvents();
        })
    }

    ngOnInit() {
        this.setFlag();
        this.selectedName = 'My Events'
        this.selectedGroup = 'myEvents'
        this.filterName = 'All Events';
    }
    setFlag() {
        this.zone.run(() => {
        this.userService.getTypeU(this.userId, snap => {
            if (snap.val() === 'teacher') {
                this.flag = true;
                this.getUserGroups();
            }
            else {
                this.flag = false;
                this.getStudents();
            }
        })
    })
    }

    addEvent() {
        let modal = this.modalCtrl.create(CreateEventPage, { selectedDay: this.selectedDay });
        modal.present();
        modal.onDidDismiss(data => {
            if (data) {
                let eventData = data;

                eventData.startTime = new Date(data.startTime);
                eventData.endTime = new Date(data.endTime);
                eventData.title = data.title;
                eventData.location = data.location;
                let events = this.eventSource;
                events.push(eventData);
                this.eventSource = [];
                setTimeout(() => {
                    this.eventSource = events;
                });
            }
        });
    }

    getUserGroups() {
        //this.userGroups.length = 0;
        this.userService.getGroupsPerUser(this.userId, (snap) => {
            this.userGroups.push(snap.val());
        })
    }
    getStudents() {
        //this.students.length = 0;
        this.userService.getStudentProfile(this.userId, (snap) => {
            this.students.push(snap.val());
        })
    }

    selectGroup() {
        let alert = this.alertCtrl.create();
        alert.setTitle('select user Class');
        alert.addInput({
            type: 'radio',
            label: 'My Events',
            value: 'personalEvents',
            checked: true
        });
        if (this.flag) {
            this.getUserGroups();
            this.userGroups.forEach((element) => {
                let groupname = element.groupName;
                let groupkey: string = element.key;
                alert.addInput({
                    type: 'radio',
                    label: groupname,
                    value: groupkey,
                });
            })
        } else {
            this.students.forEach((element) => {
                let groupname = element.username;
                let groupkey: string = element.userkey;
                alert.addInput({
                    type: 'radio',
                    label: groupname,
                    value: groupkey,
                });
            })
        }
        alert.addButton('Cancel');
        alert.addButton({
            text: 'Okay',
            handler: data => {
                this.selectedGroup = data;
                this.setSelectedName(data);
            }
        });
        alert.present().then(() => {
            this.userGroups.length = 0;
            //this.students.length = 0;
        });
    }

    setSelectedName(data: string) {
        this.filterName = 'All Events';
        this.zone.run(() => {
        if (data === 'personalEvents') {
            this.getUserEvents();
            this.selectedName = 'My Events';
        } else if (this.flag) {
            this.userService.getGroupName(data).then(snap => {
                this.selectedName = snap.val();
            })
            this.getGroupEvents(data);

        } else {
            this.userService.getUsername(data, snap => {
                this.selectedName = snap.val();
            })
            this.getUserScheduleEvents(data);
        }
    })
    }


    /*
    setEvents(data: any) {
        let eventData = data;

        eventData.startTime = new Date(data.startTime);
        eventData.endTime = new Date(data.endTime);
        eventData.title = data.title;
        eventData.location = data.location;
        let events = this.eventSource;
        events.push(eventData);
        this.eventSource = [];

        setTimeout(() => {
            this.eventSource = events;
        });
    }
    */
    getGroupEvents(groupId: string) {
        var self = this;
        //this.eventSource.length = 0;
        this.eventsArray.length = 0;
        this.eventService.getGroupEvents(groupId, snap => {
            self.itemsService.reversedItems<IEvent>(self.eventService.getEvents(snap)).forEach(function (data) {
                self.eventsArray.push(data);

            });
            this.eventSource = this.eventsArray;
        })
    }
    getUserEvents() {
        var self = this;
        this.eventSource.length = 0;
        this.eventService.getUserEvents(self.userId, (snapshot) => {
            self.itemsService.reversedItems<IEvent>(self.eventService.getEvents(snapshot)).forEach(function (data) {
                self.eventsArray.push(data);

            });
            this.eventSource = this.eventsArray;
        })
    }

    getUserScheduleEvents(userId: string) {
        var self = this;
        this.eventSource.length = 0;
        this.eventService.getScheduleEvents(userId, snap => {
            self.itemsService.reversedItems<IEvent>(self.eventService.getEvents(snap)).forEach(function (data) {

                self.eventsArray.push(data);

            });
            this.eventSource = this.eventsArray;
        })
    }
    /*
    isDisableButton(eventDate: string): boolean {

        let today = new Date().toISOString().slice(0, 10);
        if (eventDate > today) {
            return true;
        } else {
            return false;
        }
    }
    */
    filterData() {

        let alert = this.alertCtrl.create();
        alert.setTitle('Select Filter To see The Events');
        alert.addInput({
            type: 'radio',
            label: 'Upcoming',
            value: 'upcoming',
            checked: true
        });
        alert.addInput({
            type: 'radio',
            label: 'Previous',
            value: 'previous',

        });

        alert.addButton('Cancel');
        alert.addButton({
            text: 'Okay',
            handler: data => {
                this.setFilterName(data);
            }
        });
        alert.present().then(() => {
        });

    }
    setFilterName(data: string) {
        if (this.filterName == 'All Events') {
            if (data === 'upcoming') {
                this.filterName = 'Upcoming';
                this.getUpcomingEvents();
            } else if (data === 'previous') {
                this.filterName = 'Previous';
                this.getPreviouEvents();
            }
        } else {
            let toast = this.toastCtrl.create({
                message: 'Please Select Event Category first',
                duration: 3000,
                position: 'top'
            });
            toast.present();
        }
            
    }

    getUpcomingEvents() {
        this.today = new Date().toISOString();
        this.eventsArray.forEach(data => {
            if (data.startTime < this.today) {
                this.eventsArray.splice(this.eventsArray.indexOf(data), 1);
            }
        })
    }

    getPreviouEvents() {
        this.today = new Date().toISOString();
        this.eventsArray.forEach(data => {
            if (data.startTime >= this.today) {
                this.eventsArray.splice(this.eventsArray.indexOf(data), 1);
            }
        })
    }
}
    /*
        
    changeMode(mode) {
        this.calendar.mode = mode
    }

    acceptEvent(eventKey: string) {
        let status: boolean = true;
        this.eventService.addEventUser(eventKey, this.userId, status).then(()=>{
            let toast = this.toastCtrl.create({
                message: 'Acceptance status updated',
                duration: 3000,
                position: 'top'
            });
            toast.present();
        })
    }
    rejectEvent(eventKey) {
        let status: boolean = false;
        this.eventService.addEventUser(eventKey, this.userId, status).then(() => {
            let toast = this.toastCtrl.create({
                message: 'Rejection status updated',
                duration: 3000,
                position: 'top'
            });
            toast.present();
        })
    }
    getStatus(eventKey: string) {
        let status: boolean;
        this.eventService.getUserEventStatus(eventKey, this.userId), function (snap) {
            status = snap.val();
        }
        return status;
    }
}

 
    onViewTitleChanged(title) {
        this.viewTitle = title;
    }

    onEventSelected(event) {
        let start = moment(event.startTime).format('LLLL');
        let end = moment(event.endTime).format('LLLL');

        let alert = this.alertCtrl.create({
            title: '' + event.title,
            subTitle: 'From: ' + start + '<br>To: ' + end,

            buttons: ['OK']
        })
        alert.present();
    }

    onTimeSelected(ev) {
        this.selectedDay = ev.selectedTime;
    }
*/