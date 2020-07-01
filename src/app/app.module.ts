import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, Http } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage, IonicStorageModule } from '@ionic/storage';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { MyApp } from './app.component';

import { CardsPage } from '../pages/cards/cards';

import { ItemCreatePage } from '../pages/item-create/item-create';
import { ItemDetailPage } from '../pages/item-detail/item-detail';
import { ListMasterPage } from '../pages/list-master/list-master';
import { LoginPage } from '../pages/login/login';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { MenuPage } from '../pages/menu/menu';
import { SearchPage } from '../pages/search/search';
import { SettingsPage } from '../pages/settings/settings';
import { SignupPage } from '../pages/signup/signup';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { WelcomePage } from '../pages/welcome/welcome';
import { Homework } from '../pages/homework/homework';
import { HomeworkCreate } from '../pages/homework-create/homework-create';
import { CommentCreatePage } from '../pages/comment-create/comment-create';
import { CommentsPage } from '../pages/comments/comments';
import { ContactsPage } from '../pages/contacts/contacts';
import { ChatViewPage } from '../pages/chat-view/chat-view';
import { ChatsPage } from '../pages/chats/chats';
import { ReviewPage } from '../pages/review/review';
import { CreateEventPage } from '../pages/create-event/create-events';
import { TimelogPage } from '../pages/timelog/timelog';
import { ProfilePage } from '../pages/profile/profile';
import { UserCalenderPage } from '../pages/user-calender/user-calender';
import { UserAvatarComponent } from '../providers/components/user-avatar.component';
import { ResultcardPage } from '../pages/resultcard/resultcard';
import { Api } from '../providers/api';
import { Items } from '../mocks/providers/items';
import { Settings } from '../providers/settings';
import { User } from '../providers/user';
import { UserService } from '../providers/services/user.service';
import { DataService } from '../providers/services/data.service';
import { ItemsService } from '../providers/services/items.service';
import { MappingsService } from '../providers/services/mappings.service';
import { ChatsService } from '../providers/services/chats.service';
import { ScheduleEventService } from '../providers/services/scheduleEvent.service';

import { Camera } from '@ionic-native/camera';
import { GoogleMaps } from '@ionic-native/google-maps';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { PhotoViewer } from '@ionic-native/photo-viewer';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import * as firebase from "firebase";

import { NgCalendarModule } from 'ionic2-calendar';


export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function provideSettings(storage: Storage) {
  /**
   * The Settings provider takes a set of default settings for your app.
   *
   * You can add new settings options at any time. Once the settings are saved,
   * these values will not overwrite the saved values (this can be done manually if desired).
   */
  return new Settings(storage, {
    option1: true,
    option2: 'Ionitron J. Framework',
    option3: '3',
    option4: 'Hello'
  });
}

  // Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBv_YMX7bZYB_V3TDREUw1MNUpsC0PRqs4",
    authDomain: "e-dairy-93b76.firebaseapp.com",
    databaseURL: "https://e-dairy-93b76.firebaseio.com",
    projectId: "e-dairy-93b76",
    storageBucket: "e-dairy-93b76.appspot.com",
    messagingSenderId: "860786917805"
};
firebase.initializeApp(firebaseConfig);

/**
 * The Pages array lists all of the pages we want to use in our app.
 * We then take these pages and inject them into our NgModule so Angular
 * can find them. As you add and remove pages, make sure to keep this list up to date.
 */
let pages = [
  MyApp,
  CardsPage,
  //ContentPage,
  ItemCreatePage,
  ItemDetailPage,
  ListMasterPage,
    LoginPage, ResetPasswordPage,
    /*MapPage,*/ UserCalenderPage,
    MenuPage, ReviewPage,
    SearchPage, TimelogPage, ProfilePage,
    SettingsPage, CreateEventPage, ResultcardPage,
    ContactsPage, ChatsPage, ChatViewPage,
    SignupPage, UserAvatarComponent,
    Homework, HomeworkCreate, CommentsPage, CommentCreatePage,
  TutorialPage,
  WelcomePage
];

export function declarations() {
  return pages;
}

export function entryComponents() {
  return pages;
}

export function providers() {
  return [
    Api,
    Items,
    User,
    Camera,
    GoogleMaps,
      SplashScreen, PhotoViewer,
      StatusBar, ChatsService, ScheduleEventService,
      UserService, DataService, ItemsService, MappingsService,/* HomeworkService,*/
    { provide: Settings, useFactory: provideSettings, deps: [Storage] },
    // Keep this to enable Ionic's runtime error handling during development
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ];
}

@NgModule({
  declarations: declarations(),
  imports: [
      NgCalendarModule,
    BrowserModule,
      HttpModule,
      AngularFireModule.initializeApp(firebaseConfig),
      AngularFireDatabaseModule,
      AngularFireAuthModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: entryComponents(),
  providers: providers()
})
export class AppModule { }
