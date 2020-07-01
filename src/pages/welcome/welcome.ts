import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { SignupPage } from '../signup/signup';
import { ResetPasswordPage } from '../reset-password/reset-password';
//import firebase from 'firebase';
/**
 * The Welcome Page is a splash page that quickly describes the app,
 * and then directs the user to create an account or log in.
 * If you'd like to immediately put the user onto a login/signup page,
 * we recommend not using the Welcome page.
*/
@Component({
    selector: 'page-welcome',
    templateUrl: 'welcome.html'
})
export class WelcomePage {
    //public recaptchaVerifier: firebase.auth.RecaptchaVerifier;
    constructor(public navCtrl: NavController,
        private alertCtrl: AlertController) { }

    login() {
        this.navCtrl.push(LoginPage);
    }

    signup() {
        this.navCtrl.push(SignupPage);
    }
     
    goToResetPassword() {
        this.navCtrl.push(ResetPasswordPage);
    }

    ionViewDidLoad() {
    //    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    }

    /*

    SignIN(phoneNumber: number) {
        const appVerifier = this.recaptchaVerifier;
        const phoneNumberString = "+" + phoneNumber;
        firebase.auth().signInWithPhoneNumber(phoneNumberString, appVerifier)
            .then(confirmationResult => {
                // SMS sent. Prompt user to type the code from the message, then sign the
                // user in with confirmationResult.confirm(code).
                let prompt = this.alertCtrl.create({
                    title: 'Enter the Confirmation code',
                    inputs: [{ name: 'confirmationCode', placeholder: 'Confirmation Code' }],
                    buttons: [
                        {
                            text: 'Cancel',
                            handler: data => { console.log('Cancel clicked'); }
                        },
                        {
                            text: 'Send',
                            handler: data => {
                                confirmationResult.confirm(data.confirmationCode)
                                    .then(function (result) {
                                        // User signed in successfully.
                                        console.log(result.user);
                                        // ...
                                    }).catch(function (error) {
                                        // User couldn't sign in (bad verification code?)
                                        // ...
                                    });
                            }
                        }
                    ]
                });
                prompt.present();
            })
            .catch(function (error) {
                console.error("SMS not sent", error);
            });

    }*/
}