import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {NativeAudio} from "@ionic-native/native-audio";
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import {BeaconScannerService} from "../pages/services/beaconscanner.service";
import {SettingsPage} from "../pages/settings/settings";

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    SettingsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    SettingsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    InAppBrowser,
    NativeAudio,
    BeaconScannerService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
