import { Component, OnInit } from '@angular/core';
import { NavController, ViewController, LoadingController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UserCredentials } from '../../providers/interfaces';
import { DataService } from '../../providers/services/data.service';
import { UserService } from '../../providers/services/user.service';
import { CheckedValidator } from '../../providers/validators/checked.validator';
import { EmailValidator } from '../../providers/validators/email.validator';


import { MainPage } from '../../pages/pages';
//import { User } from '../../providers/user';

import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
    createAccountForm: FormGroup;
    username: AbstractControl;
    email: AbstractControl;
    password: AbstractControl;
    usertype: AbstractControl;
    terms: AbstractControl;


    constructor(public nav: NavController,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public viewCtrl: ViewController,
        public fb: FormBuilder,
        public dataService: DataService,
        public userService: UserService) { }

    ngOnInit() {
        this.createAccountForm = this.fb.group({
            'username': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
            'email': ['', Validators.compose([Validators.required, EmailValidator.isValid])],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(5)])],
            'usertype': ['', Validators.required],
            'terms': [false, CheckedValidator.isChecked]
        });

        this.username = this.createAccountForm.controls['username'];
        this.email = this.createAccountForm.controls['email'];
        this.password = this.createAccountForm.controls['password'];
        this.usertype = this.createAccountForm.controls['usertype'];
        this.terms = this.createAccountForm.controls['terms'];
    }


    onSubmit(signupForm: any): void {
        var self = this;

        if (this.createAccountForm.valid) {

            let loader = this.loadingCtrl.create({
                content: 'Creating account...',
                dismissOnPageChange: true
            });

            let newUser: UserCredentials = {
                email: signupForm.email,
                password: signupForm.password
            };

            loader.present();

            this.userService.registerUser(newUser)
                .then(function (result) {
                    self.userService.addUser(signupForm.username, signupForm.usertype, self.userService.getLoggedInUser().uid);
                    loader.dismiss()
                        .then(() => {
                            self.viewCtrl.dismiss({
                                user: newUser
                            }).then(() => {
                                let toast = self.toastCtrl.create({
                                    message: 'Account created successfully',
                                    duration: 4000,
                                    position: 'top'
                                });
                                toast.present();
                                self.CreateAndUploadDefaultImage();
                                    self.nav.setRoot(MainPage);
                            });
                        });
                }).catch(function (error) {
                    //var errorCode = error.code;
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
    }

    CreateAndUploadDefaultImage() {
        let self = this;
        let imageData = '../../assets/img/profile.png';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', imageData, true);
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
            if (xhr.status === 200) {
                var myBlob = xhr.response;
                // myBlob is now the blob that the object URL pointed to.
                self.startUploading(myBlob);
            }
        };
        xhr.send();
    }

    startUploading(file) {

        let self = this;
        let uid = self.userService.getLoggedInUser().uid;
        let progress: number = 0;
        // display loader
        let loader = this.loadingCtrl.create({
            content: 'Uploading default image..',
        });
        loader.present();

        // Upload file and metadata to the object 'images/mountains.jpg'
        var metadata = {
            contentType: 'image/png',
            name: 'profile.png',
            cacheControl: 'no-cache',
        };

        var uploadTask = self.dataService.getStorageRef().child('profiles/' + uid + '/profile.png').put(file, metadata);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
            function (snapshot) {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
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
                    self.dataService.setUserImage(uid);
                });
            });
    }
    /*
  doSignup() {
    // Attempt to login in through our User service
    this.user.signup(this.account).subscribe((resp) => {
      this.navCtrl.push(MainPage);
    }, (err) => {

      this.navCtrl.push(MainPage); // TODO: Remove this when you add your signup endpoint

      // Unable to sign up
      let toast = this.toastCtrl.create({
        message: this.signupErrorString,
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });
  }*/
}
