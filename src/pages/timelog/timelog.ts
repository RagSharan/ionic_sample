import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController, NavParams } from 'ionic-angular';
import { Item } from '../../models/item';
import { UserService } from '../../providers/services/user.service';
import { FirebaseListObservable } from 'angularfire2/database';
@Component({
    selector: 'timelog',
    templateUrl: 'timelog.html'
})
export class TimelogPage implements OnInit {
    flag: boolean;
    userGroups: Array<any> = [];
    user: any;

    userId: string;
    userKey: string;
    groupKey: string;
    groupName: string;
    attendance: FirebaseListObservable<any>;

    constructor(public navCtrl: NavController, 
        public modalCtrl: ModalController, navParam: NavParams,
        private alertCtrl: AlertController,
         public userService: UserService) {
        this.userId = this.userService.getLoggedInUser().uid;
        this.user = navParam.get('user');
        this.userKey = this.user.userkey;
        this.groupKey = navParam.get('groupKey');
        this.groupName = navParam.get('groupName');
    
        
    }
    ngOnInit() {
        this.setFlag();
    }
    setFlag() {
        this.userService.getTypeU(this.userId, snap => {
            if (snap.val() === 'parents') {
                this.flag = true;
                this.getUserGroups();
                }
            else {
                this.flag = false;
                this.getAttendance();
            }
        });
    }
    getAttendance() {
        this.attendance = this.userService.getAttendance(this.userKey, this.groupKey);
    }
   
    getUserGroups() {
        this.userService.getGroupsPerUser(this.userKey, (snap) => {
            this.userGroups.push(snap.val());
        })
    }
    selectGroup() {
        this.getUserGroups();
        let alert = this.alertCtrl.create();
        alert.setTitle('select user Class');
        alert.addInput({
            type: 'radio',
            label: 'Select',
            value: 'contacts',
            checked: true
        });
            this.userGroups.forEach((element) => {
                let groupname = element.groupName;
                let groupkey: string = element.key;
                alert.addInput({
                    type: 'radio',
                    label: groupname,
                    value: groupkey,
                });
            }) 
        alert.addButton('Cancel');
        alert.addButton({
            text: 'Okay',
            handler: data => {
                this.groupKey = data;
                this.setSelectedName(data);
            }
        });
        alert.present().then(() => {
            this.userGroups.length = 0;
        });
    }

    setSelectedName(data: string) {
        this.userService.getGroupName(data).then(snap => {
            this.groupName = snap.val();
        })
        this.groupKey = data;
        this.getAttendance();
    }
    filterAttendace() {
        let alert = this.alertCtrl.create();
        alert.setTitle('select user Class');
        alert.addInput({
            type: 'radio',
            label: 'Monthly',
            value: 'month',
            checked: true
        });
        alert.addInput({
            type: 'radio',
            label: 'Annual',
            value: 'year',
        });
        alert.addButton('Cancel');
        alert.addButton({
            text: 'Okay',
            handler: data => {
                this.getFilterData();
            }
        });
        alert.present().then(() => {
        });
    }

    getFilterData() {

    }
}