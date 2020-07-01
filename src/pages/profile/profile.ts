import { Component, OnInit } from '@angular/core';
import { ViewController, ToastController } from 'ionic-angular';
import { NavController, LoadingController, ActionSheetController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { DataService } from '../../providers/services/data.service';
import { UserService } from '../../providers/services/user.service';
import { Item } from '../../models/item';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { CardsPage } from '../cards/cards';


@Component({
    selector: 'page-profile',
    templateUrl: 'profile.html'
})
export class ProfilePage implements OnInit {
    userDataAccountForm: FormGroup;
    editTeacherflag: boolean = false;

    userId: string;
    username: string;
    usertype: string;
    userProfile: any = {};

    subject: AbstractControl;
    schoolName: AbstractControl;
    rank: AbstractControl;
    city: AbstractControl;
    contactNo: AbstractControl;

   // public studentArray: Array<any> = [];
    currentItems: Item[];

    constructor(public navCtrl: NavController,
        public loadingCtrl: LoadingController, 
        public actionSheeCtrl: ActionSheetController,
        public toastCtrl: ToastController, navParams: NavParams,
        public viewCtrl: ViewController,
        public fb: FormBuilder,
        private camera: Camera, 
        public dataService: DataService,
        public userService: UserService) {
        this.userId = navParams.get('item') || this.userService.getLoggedInUser().uid;
    }

    ngOnInit() {
        this.getUserType();
     //   this.loadData();
    }
    getUserType() {
        var self = this;
        this.userService.getTypeU(this.userId, snap => {
            self.usertype = snap.val();
            self.loadData();
        })
    }
    loadData() {
        if (this.usertype === 'student') {
            this.getStudentProfile();
        } else {
            this.loadTeacherData();
            this.loadParentsData();
        }
    }
    
    editUserData() {
        var self = this;
        if (this.usertype === 'teacher') {
            self.usertype = 'edit';
            self.editTeacherflag = true;
        } 
    }
    loadTeacherData() {
        this.loadTeacherProfile();
        this.userDataAccountForm = this.fb.group({
            'subject': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
            'schoolName': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
            'rank': ['', Validators.compose([Validators.required, Validators.minLength(5)])],
            'city': ['', Validators.required],
            'contactNo': ['', Validators.required]
        });

        this.subject = this.userDataAccountForm.controls['subject'];
        this.schoolName = this.userDataAccountForm.controls['schoolName'];
        this.rank = this.userDataAccountForm.controls['rank'];
        this.city = this.userDataAccountForm.controls['city'];
        this.contactNo = this.userDataAccountForm.controls['contactNo'];

    }
    getUserData() {
        var self = this;
        return self.userService.getUser(self.userId);
    }
    loadTeacherProfile() {
        var self = this;
        self.getUserData().then(function (snapshot) {
            let userData: any = snapshot.val();
            self.getUserImage().then(function (url) {
                self.userProfile = {
                    username: userData.username,
                    usertype: userData.usertype,
                    email: userData.email,
                    image: url,
                    subject: userData.subject,
                    schoolName: userData.schoolName,
                    rank: userData.rank,
                    city: userData.city,
                    contactNo: userData.contactNo,
                };

            }).catch(function (error) {
                    console.log(error.code);
            });
        });
    }

    saveUserProfile(userForm: any) {
        var self = this;
        self.userProfile = userForm;
        if (this.userDataAccountForm.valid) {

            let loader = this.loadingCtrl.create({
                content: 'saving User Data...',
                dismissOnPageChange: true
            });
            loader.present();
            self.userService.editUser(userForm.subject, userForm.schoolName, userForm.rank, userForm.city, userForm.contactNo, self.userId);
            loader.dismiss()
                .then(() => {
                    self.viewCtrl.dismiss({

                    }).then(() => {
                        let toast = self.toastCtrl.create({
                            message: 'User Data Saved successfully',
                            duration: 4000,
                            position: 'top'
                        });
                        toast.present();
                    });

                }).catch(function (error) {
                    var errorMessage = error.message;
                    console.error(error);
                    loader.dismiss().then(() => {
                        let toast = self.toastCtrl.create({
                            message: errorMessage,
                            duration: 4000,
                            position: 'top'
                        });
                        toast.present();
                    });
                });
        }
        self.editTeacherflag = false;
        self.loadTeacherProfile();

    }
    
    createChildProfile() {
        this.navCtrl.push(CardsPage, {
            parentsKey: this.userId 
        });

    }

    loadParentsData() {
        var self = this;
        let tempArray: Array<any> = [];
            this.userService.getStudentProfile(self.userId, snap => {
                tempArray.push(snap.val());
                self.setStudentData(tempArray);
            })
           
    }
    setStudentData(tempArray: Array<any>) {
        var self = this;
        let studentArray: Array<any> = [];
        tempArray.forEach((userData) => {
            self.userService.getUserImage(userData.userkey).then(function (url) {
                let studentProfile = {
                    username: userData.username,
                    image: url,
                    usertype: userData.usertype,
                    schoolName: userData.schoolName,
                    className: userData.className,
                    city: userData.city,
                };
                studentArray.push(studentProfile)
            })
        })
        this.currentItems = studentArray;
    }
    getStudentProfile() {
        var self = this;
        this.userService.getStudentById(self.userId).then(function (snapshot) {
            let userData = snapshot.val();
            console.log("student Profile=" + userData);
            self.userService.getUserImage(userData.userkey).then(function (url) {
                self.userProfile = {
                    username: userData.username,
                    image: url,
                    usertype: userData.usertype,
                    schoolName: userData.schoolName,
                    className: userData.className,
                    city: userData.city,
                };
            })
        })

    }
    
    getUserImage() {
        var self = this;
        return self.dataService.getStorageRef().child('profiles/' + self.userId + '/profile.png').getDownloadURL();
    }

    

    openImageOptions() {

        var self = this;
        let actionSheet = self.actionSheeCtrl.create({
            title: 'Upload new image from',
            buttons: [
                {
                    text: 'Camera',
                    icon: 'camera',
                    handler: () => {
                        self.openCamera(this.camera.PictureSourceType.CAMERA);
                    }
                },
                {
                    text: 'Album',
                    icon: 'folder-open',
                    handler: () => {
                        self.openCamera(this.camera.PictureSourceType.PHOTOLIBRARY);
                    }
                }
            ]
        });
        actionSheet.present();
    }



    openCamera(pictureSourceType: any) {
        var self = this;
        let options: CameraOptions = {
            quality: 95,
            destinationType: this.camera.DestinationType.DATA_URL,
            sourceType: pictureSourceType,
            encodingType: this.camera.EncodingType.PNG,
            targetWidth: 400,
            targetHeight: 400,
            saveToPhotoAlbum: true,
            correctOrientation: true
        };



        this.camera.getPicture(options).then(imageData => {
            const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];
                for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    const slice = byteCharacters.slice(offset, offset + sliceSize);
                    const byteNumbers = new Array(slice.length);

                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }
                const blob = new Blob(byteArrays, { type: contentType });
                return blob;
            };
            let capturedImage: Blob = b64toBlob(imageData, 'image/png');
            self.startUploading(capturedImage);
        }, error => {

            console.log('ERROR -> ' + JSON.stringify(error));
        });
    }
    /*reload(refresher) {

        this.loadUserProfile();
        // refresher.complete();
    }*/


    startUploading(file) {
        let self = this;
        let progress: number = 0;
        let loader = this.loadingCtrl.create({
            content: 'Uploading image..',
        });

        loader.present();
        var metadata = {
            contentType: 'image/png',
            name: 'profile.png',
            cacheControl: 'no-cache',
        };
        
        var uploadTask = self.dataService.getStorageRef().child('profiles/' + self.userId + '/profile.png').put(file, metadata);
        
        uploadTask.on('state_changed',
            function (snapshot) {
                progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            }, function (error) {
                  loader.dismiss().then(() => {
                    switch (error.code) {
                        case 'storage/unauthorized':
                            // User doesn't have permission to access the object
                            break;
                        case 'storage/canceled':
                            // User canceled the upload
                            break;
                        case 'storage/unknown':
                            // Unknown error occurred, inspect error.serverResponse
                            break;
                    }
                });

            }, function () {
                loader.dismiss().then(() => {
                    // Upload completed successfully, now we can get the download URL
                    var downloadURL = uploadTask.snapshot.downloadURL;
                    self.dataService.setUserImage(self.userId);
                    //  self.reload();
                });
            });
    }
}
interface UserProfile {
    username: string;
    usertype: string;
    image: URL;

}