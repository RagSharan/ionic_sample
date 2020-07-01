import { Component, OnInit, NgZone } from '@angular/core';
import { NavController, ModalController, MenuController, AlertController, ToastController } from 'ionic-angular';
//import { FirebaseListObservable } from 'angularfire2/database';
import { ItemCreatePage } from '../item-create/item-create';
//import { ItemDetailPage } from '../item-detail/item-detail';
import { SearchPage } from '../search/search';
import { CardsPage } from '../cards/cards';

import { Items } from '../../providers/providers';
import { UserService } from '../../providers/services/user.service';
import { Item } from '../../models/item';
import { ProfilePage } from '../profile/profile';
import { TimelogPage } from '../timelog/timelog';

@Component({
  selector: 'page-list-master',
  templateUrl: 'list-master.html'
})
export class ListMasterPage implements OnInit{
  currentItems: Item[];
  flag: boolean;
  segment: string;
  selectedSegment: string = this.segment;

  testCheckboxOpen: boolean = false;
  public selectedGroup: string;
  public selectedName: string;
  userGroups: Array<any> = [];
  users: Array<any> = [];
    userId: string

  constructor(public navCtrl: NavController, public items: Items, public modalCtrl: ModalController,
      private menuCtrl: MenuController, private userService: UserService, private zone: NgZone,
      public alertCtrl: AlertController, public toastCtrl: ToastController) {
      this.menuCtrl.enable(true, 'teacher');
      this.userId = this.userService.getLoggedInUser().uid;
      this.onNotification();
   
  }
  ngOnInit() {
      this.setFlag();
      this.segment = 'contacts';
      this.selectedName = 'Contacts';
      this.selectedGroup = 'contacts';
      this.getContactList();
      
  }
  onNotification() {
      try {
          FCMPlugin.onNotofication((data) => {
              this.alertCtrl.create({
                  message: data.message
              }).present();


          }, (error) => { console.error(error) })
      } catch (e) {
          console.error(e);
      }

  }

  setFlag() {
      this.userService.getTypeU(this.userId, snap => {
          if (snap.val() === 'teacher') {
              this.flag = true;
              this.getUserGroups();
          }
          else {
              this.flag = false;
              //this.getStudentList();
          }
      });
  }
  getUserGroups() {
      this.userService.getGroupsPerUser(this.userId, (snap) => {
          this.userGroups.push(snap.val());
      })
  }
  filterSegments(segment) {
      if (this.segment === segment) {
         // this.setSelectedName(this.selectedGroup);
          console.log("request")
      }
      else {
          //this.loadRequest();
          console.log("load requests");
      }
  }
  
  ionViewDidLoad() {
  }

  
  addItem() {
    let addModal = this.modalCtrl.create(ItemCreatePage);
    addModal.onDidDismiss(item => {
      if (item) {
        this.items.add(item);
      }
    })
    addModal.present();
  }

  openSearchPage() {
      
      if (this.selectedGroup === 'student') {
          this.navCtrl.push(CardsPage, {
              parentsKey: this.userId
          });
      } else {
          this.navCtrl.push(SearchPage, {
              item: this.selectedGroup
          });
      }
  }
 
  openItem(item: Item) {
    this.navCtrl.push(ProfilePage, {
      item: item
    });
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
      if (this.flag){
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
          alert.addInput({
              type: 'radio',
              label: 'Students',
              value: 'student',
          });
      }
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
          this.userGroups.length = 0;  
          this.testCheckboxOpen = true;
      });
  }

  setSelectedName(data: string) {
      
          if (data === 'contacts') {
              this.selectedName = 'Contacts';
              this.getContactList();
          } else if (data === 'student') {
              this.selectedName = 'Students profile';
              this.getStudentList();
          }
          else {
              this.userService.getGroupName(data).then(snap => {
                  this.selectedName = snap.val();
              })
              this.getGroupMembers(data);
          }
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
      })
      this.zone.run(() => {
          this.currentItems = this.users;
      })
  }
    
  getContactList() {
      var self = this;
      this.users.length = 0;
      this.userService.getUserContactList(self.userId, snap => {
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
      })
      this.zone.run(() => {
          this.currentItems = this.users;
      })
      }
    
  getStudentList() {
      var self = this;
      this.users.length = 0;
      this.userService.getStudentProfile(this.userId, snap => {
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
          this.zone.run(() => {
              this.currentItems = this.users;
          })
      })            
  }

  deleteItem(key: string) {
      let toast = this.toastCtrl.create({
          message: 'User removed successfully',
          duration: 3000,
          position: 'top'
      });
      let groupkey: string = this.selectedGroup;
      if (groupkey === 'contacts') {
          this.userService.removeUserFromContact(key);
          this.getContactList();
      } else {
          this.userService.removeUserFromGroup(groupkey, key);
          this.getGroupMembers(groupkey);
      }      
      toast.present();
  }

  presentUser(userKey: string) {
      if (this.selectedGroup === 'contacts') {
          let toast = this.toastCtrl.create({
              message: 'Attendace can not be marked in contacts. Choose the class to mark the attendance',
              duration: 3000,
              position: 'top'
          });
          toast.present();
      } else {
          this.userService.setUserAttendance(userKey, this.selectedGroup, "Present").then(() => {
              let toast = this.toastCtrl.create({
                  message: 'Attendance is marked Present',
                  duration: 4000,
                  position: 'top'
              });
              toast.present();
          })

      }
        }
  absentUser(userKey: string) {
      if (this.selectedGroup === 'contacts') {
          let toast = this.toastCtrl.create({
              message: 'Attendace can not be marked in contacts. Choose the class to mark the attendance',
              duration: 3000,
              position: 'top'
          });
          toast.present();
      } else {
          this.userService.setUserAttendance(userKey, this.selectedGroup, "Absent").then(() => {
              let toast = this.toastCtrl.create({
                  message: 'Attendance is marked Absent',
                  duration: 4000,
                  position: 'top'
              });
              toast.present();
          })
      }
  }
  userAttendance(user: any) {
      if (this.selectedGroup === 'contacts') {
          let toast = this.toastCtrl.create({
              message: 'Please select Class Group To see the attendance',
              duration: 3000,
              position: 'top'
          });
          toast.present();
      } else {
          this.navCtrl.push(TimelogPage, {
              user: user,
              groupKey: this.selectedGroup,
              groupName: this.selectedName
          })
      }
  }
}
