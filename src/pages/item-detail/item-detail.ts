import { Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController, NavParams, ToastController, Events } from 'ionic-angular';
import { Items } from '../../providers/providers';
import { UserService } from '../../providers/services/user.service';
import { DataService } from '../../providers/services/data.service';

@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage implements OnInit {

    userId: any;
    flag: string;
    public loading: boolean = true;
    userProfile: any ;
  constructor(public navCtrl: NavController, navParams: NavParams, items: Items,
      public userService: UserService, public toastCtrl: ToastController,
      public dataService: DataService,
      public actionSheeCtrl: ActionSheetController, public events: Events) {

      this.userId = navParams.get('item') || items.defaultItem;
      console.log("item detail page");
      this.flag = 'teacher';
      this.setFlag(this.userId);
     
      
  }
  ngOnInit() {
  //    this.setProfile();
  }

  setFlag(userId: string) {
      this.userService.getTypeU(userId, snap => {
          this.flag = snap.val();
          console.log(this.flag);
      })
  }
   
   
  
  addUserInGroups() {
      var self = this;
      let actionSheet = self.actionSheeCtrl.create({
          title: 'comment Actions',
          buttons: [
              {
                  text: 'Add to user in Group',
                  icon: 'heart',
                  handler: () => {
                    // self.addUserToGroup();
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

  
}
