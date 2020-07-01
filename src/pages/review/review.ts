import { Component, OnInit, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ToastController } from 'ionic-angular';
import { UserService } from '../../providers/services/user.service';
import { Item } from '../../models/item';
import { CommentsPage } from '../comments/comments';
import { DataService } from '../../providers/services/data.service';

@IonicPage()
@Component({
  selector: 'page-review',
  templateUrl: 'review.html',
})
export class ReviewPage implements OnInit {

    groupName: string;
    groupKey: string;
    threadKey: string;
    currentItems: Item[];
    users: Array<any> = [];
    userId: string;
    constructor(public actionSheeCtrl: ActionSheetController,
        public toastCtrl: ToastController,
        public dataService: DataService,
                public navCtrl: NavController, public navParams: NavParams,
                public userService: UserService, private zone: NgZone) {
        
  }
    ngOnInit() {
        this.userId = this.userService.getLoggedInUser().uid;
      this.groupName = this.navParams.get('groupName');
      this.groupKey = this.navParams.get('groupKey');
      this.threadKey = this.navParams.get('threadKey');
      this.getGroupMembers(this.groupKey);
  }
  getGroupMembers(groupKey: string) {
      var self = this;
      this.users.length = 0;
      this.zone.run(() => {
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
          this.currentItems = this.users;
      })
      
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ReviewPage');
  }

  openItem(student: string) {
      this.navCtrl.push(CommentsPage, {
          student: student,
          threadKey: this.threadKey
      })
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
          self.dataService.addThreadToFavorites(currentUser.uid, self.threadKey)
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

}
