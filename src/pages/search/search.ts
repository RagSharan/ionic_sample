import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController, ViewController } from 'ionic-angular';
import { FirebaseListObservable } from 'angularfire2/database';
import { ItemCreatePage } from '../item-create/item-create';
import { UserService } from '../../providers/services/user.service';
import { ProfilePage } from '../profile/profile';
import { Items } from '../../providers/providers';


@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {
  
  currentItems: any = [];
  users: FirebaseListObservable<any[]>;

  userId: string;
  filterName: string;
  testRadioOpen: boolean;
  public selectedUser: Array<string> = [];
  group: any;
  flag: boolean;
  visible: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public items: Items,
      public alerCtrl: AlertController, 
      public userService: UserService, private toastCtrl: ToastController,
      public viewCtrl: ViewController)
  {
      this.userId = this.userService.getLoggedInUser().uid;
      this.setFlag();
      this.group = navParams.get('item')
      this.filterName = "schoolName";
      this.reload();
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
  changeVisibility() {
      if (this.visible) {
          this.visible = false;
          this.reload()
      } else {
          this.visible = true;
          this.reload()
      }
  }
  reload() {
      var self = this;
      this.userService.setFilter(this.filterName);
        this.users = this.userService.getFilteredUsers();      
  }
  
  getItems(ev) {
    let val = ev.target.value;
    if (!val || !val.trim()) {
      this.currentItems = [];
      return;
    }
    this.currentItems = this.items.query({
      name: val
    });
  }

  /**
   * Navigate to the detail page for this item.
   */
  openItem(item: string) {
      if (!this.visible) { 
          this.navCtrl.push(ProfilePage, {
              item: item
          });
      } 
  }
  public doPFilter() {
      //one problem in this function related to teacher filter
      let alert = this.alerCtrl.create();
      alert.setTitle('Search Groups ');

      alert.addInput({
          type: 'radio',
          label: 'School Groups',
          value: 'schoolName',
          checked: true
      });

      alert.addInput({
          type: 'radio',
          label: 'City Groups',
          value: 'city'
      });

      alert.addButton('Cancel');
      alert.addButton({
          text: 'Ok',
          handler: data => {
              console.log('Radio data:', data);
              this.testRadioOpen = false;
              this.filterName = data;
              this.reload();

          }
      });

      alert.present().then(() => {
          this.testRadioOpen = true;
      });
  }
  public doTFilter() {
      //one problem in this function related to teacher filter
      let alert = this.alerCtrl.create();
      alert.setTitle('Search users to add in this group');

      alert.addInput({
          type: 'radio',
          label: 'School',
          value: 'schoolName',
          checked: true
      });

      alert.addInput({
          type: 'radio',
          label: 'City',
          value: 'city'
      });

      alert.addInput({
          type: 'radio',
          label: 'Teacher',
          value: 'usertype'
      });

      alert.addInput({
          type: 'radio',
          label: 'student',
          value: 'parents'
      });

      alert.addButton('Cancel');
      alert.addButton({
          text: 'Ok',
          handler: data => {
              console.log('Radio data:', data);
              this.testRadioOpen = false;
              this.filterName = data;
              this.reload();

          }
      });

      alert.present().then(() => {
          this.testRadioOpen = true;
      });
  }

  public addUsersInGroup() {
      let toast = this.toastCtrl.create({
          message: 'Users added successfully',
          duration: 3000,
          position: 'top'
      });
      if (this.selectedUser.length != 0) {
          if (this.group === 'contacts') {
              this.userService.addUsersIntoContact(this.selectedUser);
          } else {
              this.userService.addUsersInGroup(this.group, this.selectedUser);              
          }
          toast.present();
          this.viewCtrl.dismiss();
      }
  }
  
  public selectUser(key: string): void {
      if (this.selectedUser.length !== 0) {
          this.selectedUser.forEach(element => {
              if (element === key) {
                  this.selectedUser.splice(this.selectedUser.indexOf(key), 1);
              }
              else {
                  this.selectedUser.push(key);
              }
          })
      }
      else {
          this.selectedUser.push(key);
      }
  }

  
}
