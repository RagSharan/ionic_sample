import { Component, OnInit } from '@angular/core';
import { ViewController, LoadingController, ToastController } from 'ionic-angular';
import { NavController, NavParams } from 'ionic-angular';
import { ChatsService } from '../../providers/services/chats.service';
import { UserService } from '../../providers/services/user.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

//import { ChatViewPage }  from '../chat-view/chat-view';

@Component({
    templateUrl: 'chats.html'
})
export class ChatsPage implements OnInit {
    
    groupTextForm: FormGroup;
    groupMessage: AbstractControl;
    sender: string;
    groupName: string;
    groupKey: string;
    receiverArray: Array< string > =[];
    
    constructor(public chatsProvider: ChatsService, public userService: UserService, 
        public nav: NavController, params: NavParams, public fb: FormBuilder,
        public loadingCtrl: LoadingController,
        public viewCtrl: ViewController,
        public toastCtrl: ToastController) {
        this.sender = params.data.sender;
        this.groupName = params.data.groupName;
        this.groupKey = params.data.groupKey;
   
    }

    ngOnInit() {
        
        this.groupTextForm = this.fb.group({
            'groupMessage': ['', Validators.compose([Validators.required, Validators.minLength(10)])]
        });

        this.groupMessage = this.groupTextForm.controls['groupMessage'];
    }
    
    onSubmit(messageForm: any): void {
        var self = this;
        if (this.groupTextForm.valid) {

            let loader = this.loadingCtrl.create({
                content: 'Sending Message...',
                dismissOnPageChange: true
            });
            loader.present();
            self.getReceivers();
            if (self.groupMessage) {
                let messageObject = {
                    sender: this.sender,
                    message: messageForm.groupMessage,
                };
                self.chatsProvider.addGroupMessage(messageObject, self.receiverArray);
                
            }
            loader.dismiss();
            self.viewCtrl.dismiss();
        }
    }

    getReceivers() {
        this.receiverArray = this.userService.getUsersKeyPerGroup(this.groupKey);
    }
}