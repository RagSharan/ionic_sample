import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ViewController, ToastController, LoadingController } from 'ionic-angular';

import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { UserService } from '../../providers/services/user.service';


@Component({
  selector: 'page-cards',
  templateUrl: 'cards.html'
})
export class CardsPage implements OnInit {
    parentsKey: string;
    childDataForm: FormGroup;
    studentName: AbstractControl;
    schoolName: AbstractControl;
    className: AbstractControl;
    city: AbstractControl;
    

    constructor(public navCtrl: NavController, public fb: FormBuilder,
        public loadingCtrl: LoadingController, public userService: UserService,
        public toastCtrl: ToastController, params: NavParams,
        public viewCtrl: ViewController, ) {
        this.parentsKey = params.data.parentsKey;    
  }
    ngOnInit() {
        this.createChildProfile();
  }
  createChildProfile() {
      this.childDataForm = this.fb.group({
          'studentName': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
          'schoolName': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
          'className': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
          'city': ['', Validators.required],
          
      });

      this.studentName = this.childDataForm.controls['studentName'];
      this.schoolName = this.childDataForm.controls['schoolName'];
      this.className = this.childDataForm.controls['className'];
      this.city = this.childDataForm.controls['city'];
      
  }
  saveChildProfile(childForm: any) {
      var self = this;
      if (this.childDataForm.valid) {

          let loader = this.loadingCtrl.create({
              content: 'saving Student Profile...',
              dismissOnPageChange: true
          });
          loader.present();
          let studentProfile = {
              'parentsKey': self.parentsKey,
              'studentName': childForm.studentName,
              'schoolName': childForm.schoolName,
              'className': childForm.className,
              'city': childForm.city
          }
          self.userService.saveStudentProfile(studentProfile);
          loader.dismiss()
              .then(() => {
                  self.uploadDefaultImge();
                  self.viewCtrl.dismiss().then(() => {
                      let toast = self.toastCtrl.create({
                          message: 'Student Data Saved successfully',
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
  }
  uploadDefaultImge() {

  }
}