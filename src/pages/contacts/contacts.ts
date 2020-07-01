import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { UserService } from '../../providers/services/user.service';
import { ChatViewPage } from '../chat-view/chat-view';
import { Item } from '../../models/item';
import { ChatsPage } from '../chats/chats';


@Component({
    templateUrl: 'contacts.html'
})
export class ContactsPage implements OnInit {
    sender: string;
    currentItems: Item[];
    users: Array<any> = [];
    students: Array<any> = [];
    userId: string;

    flag: boolean;
    boxOpen: boolean = false;
    public selectedGroup: string;
    public selectedName: string;
    userGroups: Array<any> = [];
    count: number;

    constructor(public nav: NavController, public userService: UserService,
        public alertCtrl: AlertController, ) {
        this.count = 4;
    }
    //sender ambiguity if face aby problem
    ngOnInit() {
        this.sender = this.userService.getLoggedInUser().uid;
        
        this.setFlag();
        this.selectedName = 'Contacts';
        this.getContactList(this.sender);        
    }

    openChat(user) {

        let param = { sender: this.sender, receiver: user };
        this.nav.push(ChatViewPage, param);
        this.count = null;
    }
    setFlag() {
        this.userService.getTypeU(this.sender, snap => {
            if (snap.val() === 'teacher') {
                this.flag = true;
                this.getUserGroups();
            }
            else {
                this.flag = false;
                this.getStudents();
            }
        });
    }
    getUserGroups() {
        this.userService.getGroupsPerUser(this.sender, (snap) => {
            this.userGroups.push(snap.val());
        })
    }
    getStudents() {
        this.userService.getStudentProfile(this.sender, (snap) => {
            this.students.push(snap.val());
        })
    }
    selectGroup() {
        this.getUserGroups();
        let alert = this.alertCtrl.create();
        alert.setTitle('select user Class');
        alert.addInput({
            type: 'radio',
            label: 'Contacts',
            value: 'contacts',
            checked: true
        });
        if (this.flag) {
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
            this.getStudents();
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
                //console.log('Checkbox data:', data);
               // this.testCheckboxOpen = false;
                this.selectedGroup = data;
                this.setSelectedName(data);
            }
        });
        alert.present().then(() => {
            this.userGroups.length = 0;
            this.students.length = 0;
           // this.testCheckboxOpen = true;
        });
    }

    setSelectedName(data: string) {
        if (data === 'contacts') {
            this.selectedName = 'Contacts';
            this.getContactList(this.sender);
        } else if (!this.flag) {
            this.userService.getUsername(data, snap => {
                this.selectedName = snap.val();
            })
            this.sender = data;
            this.getContactList(data);
        }
        else {
            this.userService.getGroupName(data).then(snap => {
                this.selectedName = snap.val();
            })
            this.getGroupMembers(data);
        }
    }
    
    getContactList(userId: string) {
        var self = this;
        this.users.length = 0;
        this.userService.getUserContactList(userId, snap => {
            let userData = snap.val();
            self.userService.getUserImage(userData.userkey).then(function (url) {
                let profile: any = {
                    userkey: userData.userkey,
                    username: userData.username,
                    image: url,
                    usertype: userData.usertype,
                };
                self.users.push(profile);
            })
            this.currentItems = this.users;
        })
    }
    getGroupMembers(groupKey: string) {
        var self = this;
        this.users.length = 0;
        this.userService.getUsersPerGroup(groupKey, snap => {
            let userData = snap.val();
            self.userService.getUserImage(userData.userkey).then(function (url) {
                let profile: any = {
                    userkey: userData.userkey,
                    username: userData.username,
                    image: url,
                    usertype: userData.usertype,
                };
                self.users.push(profile);
            })
            this.currentItems = this.users;
        })
    }
    openGroupMessagePage() {
        let param = { sender: this.sender, groupName: this.selectedName, groupKey: this.selectedGroup };
        this.nav.push(ChatsPage, param);
    }
}