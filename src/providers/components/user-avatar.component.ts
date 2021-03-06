﻿import { Component, Input, OnInit } from '@angular/core';
import { PhotoViewer } from '@ionic-native/photo-viewer';

import { IUser } from '../interfaces';
import { DataService } from '../services/data.service';

@Component({
    selector: 'forum-user-avatar',
    template: ` <img *ngIf="imageLoaded" src="{{imageUrl}}" (click)="zoom()">`
})
export class UserAvatarComponent implements OnInit {
    @Input() user: IUser;
    imageLoaded: boolean = false;
    imageUrl: string;

    constructor(private dataService: DataService,
                private photoViewer: PhotoViewer) { }

    ngOnInit() {
        let self = this;
        
        let firebaseConnected: boolean = self.dataService.isFirebaseConnected(); 
        if (self.user.uid === 'default' || !firebaseConnected) {
            self.imageUrl = '../../assets/img/profile.png';
            self.imageLoaded = true;
        } else {
            self.dataService.getStorageRef().child('profiles/' + self.user.uid + '/profile.png').getDownloadURL().then(function (url) {
                self.imageUrl = url.split('?')[0] + '?alt=media' + '&t=' + (new Date().getTime());
                self.imageLoaded = true;
            });
        }
        
    /*let defaultUrl = self.dataService.getDefaultImageUrl();
    if (defaultUrl == null) {
        self.imageUrl = 'profiles/profile.png';
        self.imageLoaded = true;
        console.log('get from firebase');
        
        self.dataService.getStorageRef().child('profiles/' + self.user.uid + '/profile.png').getDownloadURL().then(function (url) {
            self.imageUrl = url.split('?')[0] + '?alt=media' + '&t=' + (new Date().getTime());
            self.imageLoaded = true;
        });
        
    } else {
        this.imageUrl = defaultUrl.replace('default', self.user.uid) + '&t=' + (new Date().getTime());
        self.imageLoaded = true;
    }*/
    }
    
    zoom() {
        this.photoViewer.show(this.imageUrl, this.user.username, { share: false });
    }
    
    getUserImage() {
        var self = this;

        return self.dataService.getStorageRef().child('profiles/' + self.user.uid + '/profile.png').getDownloadURL();
    }
}