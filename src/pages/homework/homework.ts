import { Component, OnInit, NgZone } from '@angular/core';
import { NavController, ModalController, ToastController, AlertController, Events } from 'ionic-angular';

import { UserService } from '../../providers/services/user.service';
import { DataService } from '../../providers/services/data.service';
import { IThread } from '../../providers/interfaces';
import { HomeworkCreate } from '../homework-create/homework-create';
import { MappingsService } from '../../providers/services/mappings.service';
import { ItemsService } from '../../providers/services/items.service';
import { CommentsPage } from '../comments/comments';
import { ReviewPage } from '../review/review';

@Component({
    selector: 'page-page2',
    templateUrl: 'homework.html'
})
export class Homework implements OnInit {
   
    segment: string = 'all';
    selectedSegment: string = this.segment;
    queryText: string;   
    public homework: Array<IThread> = [];
    public newThreads: Array<IThread> = [];

    userGroups: Array<any> = [];
    students: Array<any> = [];
    public selectedGroup: string;
    public selectedName: string;
    testCheckboxOpen: boolean = false;
    flag: boolean;
    userId: string;
    userKey: string;
    
    constructor(public navCtrl: NavController, public modalCtrl: ModalController,
        public toastCtrl: ToastController, public userService: UserService,
        public dataService: DataService, public alertCtrl: AlertController,    
        public mappingsService: MappingsService, public events: Events,
        public itemsService: ItemsService, private zone: NgZone) {

        this.userId = this.userService.getLoggedInUser().uid;
        this.selectedGroup = 'allwork'
        this.setFlag();
    }

    ngOnInit() {
        var self = this;
        self.segment = 'all';
    
    }
    setFlag() {
        var self = this;
        this.zone.run(() => {
        this.userService.getTypeU(this.userId, snap => {
            if (snap.val() === 'teacher') {
                self.flag = true;
                self.selectedName = 'All';
                self.getUserGroups();
                this.getThreadByUserId(this.userId)
            }
            else {
                self.flag = false;
                self.selectedName = 'Select Student';
                self.getStudents();
            }
        });
    })
    }
    reloadThreads(refresher) {
        setTimeout(() => {
            this.setSelectedName(this.selectedGroup)
            refresher.complete();
        }, 2000);
    }
    
    filterSegments(segment) {
        if (segment === 'all') {
            this.setSelectedName(this.selectedGroup);
        } else {
            if (this.selectedName === 'Select Student') {
                this.userKey = this.userId;
            }
            this.getUserFavorites();
        }
    }
    getUserFavorites() {
        var self = this;
        self.homework.length = 0;
        if (self.flag) {
            this.dataService.getFavoriteThreads(self.userId, snap => {
                self.itemsService.reversedItems<IThread>(self.mappingsService.getThreads(snap)).forEach(function (thread) {
                    self.homework.push(thread);
                });
            })
        } /*else if (self.userKey === null) {
            let toast = self.toastCtrl.create({
                message: 'Select child to see marked homework ',
                duration: 3000,
                position: 'top'
            });
            toast.present();

        } */ else{
        this.dataService.getFavoriteThreads(self.userKey, snap => {
            self.itemsService.reversedItems<IThread>(self.mappingsService.getThreads(snap)).forEach(function (thread) {
                self.homework.push(thread);
            });
        })
    }
    }
/*    searchThreads() {
        var self = this;
        if (self.queryText.trim().length !== 0) {
            self.segment = 'all';
            // empty current threads
            self.homework = [];
            self.dataService.loadThreads().then(function (snapshot) {
                self.itemsService.reversedItems<IThread>(self.mappingsService.getThreads(snapshot)).forEach(function (thread) {
                    if (thread.topic.toLowerCase().includes(self.queryText.toLowerCase()))
                        self.homework.push(thread);
                });
            });
        } else { // text cleared..
            this.reloadThreads(event);
        }
    }*/
    

    createThread() {
        var self = this;
        let modalPage = this.modalCtrl.create(HomeworkCreate);
        modalPage.onDidDismiss((data: any) => {
            if (data) {
                let toast = this.toastCtrl.create({
                    message: 'New HomeWork Posted',
                    duration: 3000,
                    position: 'bottom'
                });
                toast.present();
                    self.newThreads.push(data.thread);
                self.addNewThreads();
            }
        });
        modalPage.present();
    }

   
    public addNewThreads = () => {
        var self = this;
        self.newThreads.forEach(function (thread: IThread) {
            self.homework.unshift(thread);
        });
        self.newThreads = [];
//        self.scrollToTop();
        self.events.publish('homework:viewed');
    }

    getUserGroups() {
        this.userService.getGroupsPerUser(this.userId, (snap) => {
            this.userGroups.push(snap.val());
        })
    }
    getStudents() {
        this.userService.getStudentProfile(this.userId, (snap) => {
            this.students.push(snap.val());
        })
    }
    
    selectGroup() {
        let alert = this.alertCtrl.create();
        alert.setTitle('select user Class');
        alert.addInput({
            type: 'radio',
            label: 'All',
            value: 'allWork',
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
        });
    }

    setSelectedName(data: string) {
        var self = this;
        this.zone.run(() => {
                if (self.flag) {
                    if (data === 'allWork') {
                        self.selectedName = 'All';
                        self.getThreadByUserId(self.userId);
                    } else {
                        self.userService.getGroupName(data).then(snap => {
                            self.selectedName = snap.val();
                        })
                        self.getThreadByGroupId(data);
                    }
                } else {
                    if (data === 'allWork') {
                        self.selectedName = 'Select Student';
                        self.userKey = self.userId;
                        self.getParentsThread(self.userKey);
                    } else {
                        self.userKey = data;
                        self.userService.getUsername(data, snap => {
                            self.selectedName = snap.val();
                        })
                        if (self.segment === 'all') {
                            self.getThreadByUserId(data);
                        } else {
                            self.getUserFavorites();
                        }
                    }
            }  
    })
    }

    getThreadByGroupId(groupId: string) {
        var self = this;
        self.homework.length = 0;
        this.zone.run(() => {
            this.dataService.getHomeWorkByGroupId(groupId, snap => {
                self.itemsService.reversedItems<IThread>(self.mappingsService.getThreads(snap)).forEach((thread) => {
                    self.homework.push(thread);
                });
            })
        })
    }
    getThreadByUserId(userId: string) {
        var self = this;
        self.homework.length = 0;
        this.zone.run(() => {
            this.dataService.getHomeWorkByUserId(userId, snap => {
                self.itemsService.reversedItems<IThread>(self.mappingsService.getThreads(snap)).forEach((thread) => {
                    self.homework.push(thread);
                });
            })
        })
    }

    
    getParentsThread(dataId: string) {
        var self = this;
        self.homework.length = 0;
        if (self.segment === 'all') {
            if (self.selectedName === 'All') {
                self.userKey = self.userId;
            }
            this.getUserFavorites();
        }
    }
   

    reviewThread(key: string) {
        var self = this;
        if (self.flag) {
            if (self.selectedName == 'All') {
                let toast = self.toastCtrl.create({
                    message: 'Please select Class to Review',
                    duration: 3000,
                    position: 'top'
                });
                toast.present();
            } else {
                self.navCtrl.push(ReviewPage, {
                    threadKey: key,
                    groupKey: this.selectedGroup,
                    groupName: this.selectedName
                })
            }
        } else {
            this.reviewParentsFavorite(key);
        }
    }
    reviewFavoritesThread(threadKey: string, selectedGroup: string) {
        var self = this;
        if (this.flag) {
            this.userService.getGroupName(selectedGroup).then(snap => {
                this.selectedName = snap.val();
            }).then(() => {
                self.navCtrl.push(ReviewPage, {
                    threadKey: threadKey,
                    groupKey: selectedGroup,
                    groupName: this.selectedName
                })
            })
        } else {
            this.reviewParentsFavorite(threadKey);
        }
    }
    reviewParentsFavorite(threadKey: string) {
        var self = this;
        self.userService.getUsername(self.userKey, snap => {
            let username = snap.val();
            self.userService.getUserImage(self.userKey).then(function (url) {
                let student: any = {
                    userkey: self.userKey,
                    username: username,
                    image: url,
                }
                self.navCtrl.push(CommentsPage, {
                    threadKey: threadKey,
                    student: student
                })
            })
        })
    }
}
