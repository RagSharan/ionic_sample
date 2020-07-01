import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, Config } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirstRunPage } from '../pages/pages'; 
import { ListMasterPage } from '../pages/list-master/list-master';
import { Homework } from '../pages/homework/homework';
import { ContactsPage } from '../pages/contacts/contacts';

//import { TimelogPage } from '../pages/timelog/timelog';
import { SettingsPage } from '../pages/settings/settings';
import { ProfilePage } from '../pages/profile/profile';
import { LoginPage } from '../pages/login/login';
import { UserService } from '../providers/services/user.service';
import { Settings } from '../providers/providers';
import { UserCalenderPage } from '../pages/user-calender/user-calender';
import { ResultcardPage } from '../pages/resultcard/resultcard';
import { TranslateService } from '@ngx-translate/core';

@Component({
    template: `<ion-nav [root]="rootPage" #content swipeBackEnabled="false"></ion-nav>
<!--<ion-nav [root]="rootPage"></ion-nav> -->

<ion-menu id="teacher" menuClose [content]="content" color ="danger">
  <ion-header>
    <ion-toolbar color="danger">
      <ion-row>
          <ion-col><h3>Menu</h3></ion-col>
          <ion-col>
                <button ion-button clear icon-only (click)="openProfile()">
                  <ion-icon name="contact" color="light"></ion-icon>
                </button>  
          </ion-col>
      </ion-row>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-list>
      <button menuClose ion-item *ngFor="let p of teacherMenu" (click)="openPage(p)" color="light">
        <ion-icon [name]="p.icon" item-left color="danger"></ion-icon>
        {{p.title}}
      </button>
    </ion-list>
  </ion-content>
<ion-footer>

  <ion-row>
    <ion-col>
      <button ion-button icon-only (click)="settings()" color="light">
        <ion-icon name="settings" color="danger"></ion-icon>
      </button>
    </ion-col>
    
    <ion-col>
        <button ion-button clear icon-only (click)="logout()" item-right>
           <ion-icon name="log-out" color="danger"></ion-icon>
        </button>
    </ion-col>
  </ion-row>
  
</ion-footer>

</ion-menu>`
})
export class MyApp {
  rootPage = FirstRunPage;

  @ViewChild(Nav) nav: Nav;
    

  teacherMenu: Array<{ icon: string, title: string, component: any }>;
  
  constructor(private translate: TranslateService, private platform: Platform,
      settings: Settings, private config: Config, private statusBar: StatusBar,
      private splashScreen: SplashScreen, private userService: UserService) {
      this.initTranslate();

      this.teacherMenu = [
          { icon: 'home', title: 'Home', component: ListMasterPage },
          { icon: 'create', title: 'Homework', component: Homework },
          { icon: 'mail', title: 'Messages', component: ContactsPage },
          { icon: 'calendar', title: 'UserCalender', component: UserCalenderPage },
          { icon: 'card', title: 'ResultCard', component: ResultcardPage },

      ];
        
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {

      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  initTranslate() {
    // Set the default language for translation strings, and the current language.
    this.translate.setDefaultLang('en');

    if (this.translate.getBrowserLang() !== undefined) {
      this.translate.use(this.translate.getBrowserLang());
    } else {
      this.translate.use('en'); 
    }

    this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
      this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }
  openProfile() {
      this.nav.push(ProfilePage);
  }
  logout() {
      this.userService.signOut().then(() => {
          this.nav.setRoot(LoginPage);
      })
  }
  settings() {
      this.nav.push(SettingsPage);
  }
}
