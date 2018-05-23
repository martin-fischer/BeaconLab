import {Component} from '@angular/core';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {NativeAudio} from "@ionic-native/native-audio";
import {Platform} from "ionic-angular";
import {BeaconScannerService} from "../services/beaconscanner.service";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  playingInProgress: boolean = false;

  constructor(private platform: Platform, private iab: InAppBrowser, private nativeAudio: NativeAudio, private beaconScannerService: BeaconScannerService) {
  }

  ionViewWillEnter():void {
    if (this.beaconScannerService.scanningInProgress) {
      this.beaconScannerService.startScanningForBeacons();
    }

    // Timer that refreshes the beacon list.
    setInterval(this.getBeaconList, 2000);
  }

  getBeaconList() {
    return this.beaconScannerService.getBeaconList();
  }

  showPaintingInfo(): void {
    this.iab.create('https://en.wikipedia.org/wiki/Philosopher_in_Meditation');
  }

  playPaintingInfo(): void {
    this.nativeAudio.preloadComplex('rembrandt', 'assets/sounds/Rembrandt_Selbstbildnis_als_der_verlorene_ Sohn_im_Wirtshaus.mp3', 1, 1, 0).then(() => {
      this.nativeAudio.play('rembrandt').then(() => {
        this.playingInProgress = true;
      }, (error) => {
        this.playingInProgress = false;
      });
    }, (error) => {
      this.playingInProgress = false;
    });
  }

  stopPaintingInfo() {
    this.nativeAudio.stop('rembrandt').then(() => {}, () => {});
  }
}
