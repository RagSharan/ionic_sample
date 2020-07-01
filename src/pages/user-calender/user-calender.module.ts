import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserCalenderPage } from './user-calender';

@NgModule({
  declarations: [
    UserCalenderPage,
  ],
  imports: [
    IonicPageModule.forChild(UserCalenderPage),
  ],
  exports: [
    UserCalenderPage
  ]
})
export class UserCalenderPageModule {}
