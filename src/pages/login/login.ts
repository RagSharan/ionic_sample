import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, MenuController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { MainPage } from '../../pages/pages';
import { UserService } from '../../providers/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { IUser } from '../../providers/interfaces';
import { UserCredentials } from '../../providers/interfaces';
import { EmailValidator } from '../../providers/validators/email.validator';
import { CheckedValidator } from '../../providers/validators/checked.validator';
import { ListMasterPage } from '../list-master/list-master';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
    loginAccountForm: FormGroup;
    email: AbstractControl;
    password: AbstractControl;
    usertype: string;
    user: IUser;
    firebaseAccount: any = {};

  constructor(public navCtrl: NavController,
      public userService: UserService, public loadingCtrl: LoadingController,
      public toastCtrl: ToastController, public fb: FormBuilder,
      public translateService: TranslateService,
      menuCtrl: MenuController) {
      //menuCtrl.enable(false, 'student');
      menuCtrl.enable(false, 'teacher');
      //this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      //this.loginErrorString = value;
    //})
  }
  ngOnInit() {

      this.loginAccountForm = this.fb.group({
          'email': ['', Validators.compose([Validators.required])],
          'password': ['', Validators.compose([Validators.required, Validators.minLength(5)])]
      });
      this.email = this.loginAccountForm.controls['email'];
      this.password = this.loginAccountForm.controls['password'];
  }


  onSubmit(signInForm: any): void {
      var self = this;
      if (this.loginAccountForm.valid) {
          let loader = this.loadingCtrl.create({
              content: 'Signing in ...',
              dismissOnPageChange: true
          });

          loader.present();
          let user: UserCredentials = {
              email: signInForm.email,
              password: signInForm.password
          };

          console.log(user);
          this.userService.signInUser(user.email, user.password).then(function (result) {
                  self.navCtrl.setRoot(ListMasterPage);

              }).catch(function (error) {
                  // var errorCode = error.code;
                  var errorMessage = error.message;
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


  // Attempt to login in through our User service
    /*
  doLogin() {
      this.userService.login(this.account).subscribe((resp) => {
          this.navCtrl.setRoot(MainPage);
      }, (err) => {
          this.navCtrl.setRoot(MainPage);
      // Unable to log in
      let toast = this.toastCtrl.create({
        message: this.loginErrorString,
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });
  }
    */
  loadUserType() {
      
      let userId = this.userService.getLoggedInUser().uid;
      let usertype = this.userService.getUsertype(userId);
          if (usertype === 'teacher') {
              this.navCtrl.setRoot(ListMasterPage);
          } else this.navCtrl.setRoot(ListMasterPage);
    } 
    
  
    /*
  goToResetPassword() {
      this.navCtrl.push(ResetPasswordPage);
  }

  createAccount() {
      this.navCtrl.push(SignupPage);
  }*/
}
