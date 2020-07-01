import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResultcardPage } from './resultcard';

@NgModule({
  declarations: [
    ResultcardPage,
  ],
  imports: [
    IonicPageModule.forChild(ResultcardPage),
  ],
  exports: [
    ResultcardPage
  ]
})
export class ResultcardPageModule {}
