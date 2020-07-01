import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { ChatsService } from '../../providers/services/chats.service';
import { UserService } from '../../providers/services/user.service';

@Component({
  templateUrl: 'chat-view.html',
})
export class ChatViewPage {
  message: string;
  sender: string;
  receiver: string;
  user: any
  chats: Array<any> = []
  count: number;

  @ViewChild(Content) content: Content;
  constructor(public nav: NavController, 
              params: NavParams, public chatsProvider:ChatsService, 
              public db:AngularFireDatabase, public userService: UserService) {
    
    this.sender = params.data.sender;
    this.user = params.data.receiver;
    this.receiver = this.user.userkey;
    //console.log("receiver=" + this.receiver);
    this.count = 10;
    //this.receiverName = this.userService.getUsername(this.receiver);
    this.getMessages();
  }

  ionViewDidEnter() {
      this.autoScroll();
  }

    
  autoScroll() {
      var self = this;
      setTimeout(function ()  {
          self.content.scrollToBottom();
      }, 1000);
  }
  getMessages() {
      this.chatsProvider.getMessages(this.sender, this.receiver, this.count, snap => {
          this.chats.push(snap.val());
      })
  }

  sendMessage() {
      if(this.message) {
          let messageObject = {
              sender: this.sender,
              message: this.message,
              receiver: this.receiver
          };
          this.chatsProvider.addMessage(messageObject);
          this.message = "";
      }
      this.autoScroll();
  };
  
  sendPicture() {
      let chat = {from: this.sender, type: 'picture', picture:null};
      this.userService.getPicture()
      .then((image) => {
          chat.picture =  image;
          this.chats.push(chat);
      });
  }

  reloadMessages(refresher) {
      this.count = this.count + 5;
      this.chats.length = 0;
        this.getMessages();
          refresher.complete();
  }
}
