import {Component} from '@angular/core';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {NativeAudio} from "@ionic-native/native-audio";
import _ from "lodash";
import {BeaconScannerService} from "../services/beaconscanner.service";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  nearestBeacon;
  playingInProgress: boolean = false;

  initializedBeaconsWithPaitingInformation: boolean = false;

  constructor(private beaconScannerService: BeaconScannerService, private iab: InAppBrowser, private nativeAudio: NativeAudio) {
  }

  ionViewWillEnter(): void {
    if (this.beaconScannerService.scanningInProgress) {
      this.beaconScannerService.startScanningForBeacons();
    }

    // Timer that refreshes the beacon list.
    setInterval(() => this.loadNearestBeacon(), 1000);
  }

  loadNearestBeacon() {
    let beacons = this.beaconScannerService.getBeaconList();
    let sortedBeacons =  this.beaconScannerService.sortBeaconList(beacons);
    if (! this.initializedBeaconsWithPaitingInformation) {
      this.initializeBeaconsWithPaitingInformation(sortedBeacons);
    }

    if (sortedBeacons && sortedBeacons.length > 0) {
      let nearestBeacon = sortedBeacons[0];
      if (this.isBeaconInReach(nearestBeacon)) {
        this.nearestBeacon = nearestBeacon;
      }
    }
    this.nearestBeacon = undefined;
  }

  initializeBeaconsWithPaitingInformation(beaconList): void {
    _.forEach(beaconList, (beacon) => {
      if (this.beaconScannerService.isBlueberryBeacon(beacon)) {
        beacon.objectId = 'rembrandt1';
        beacon.objectTitle = 'Das BLUEBERRY Gemälde 1';
        beacon.objectPainter = 'Rembrandt';
        beacon.objectURL = 'https://en.wikipedia.org/wiki/Philosopher_in_Meditation';
        beacon.soundFile = 'assets/sounds/Rembrandt_Selbstbildnis_als_der_verlorene_ Sohn_im_Wirtshaus.mp3';
      } else if (this.beaconScannerService.isIceBeacon(beacon)) {
        beacon.objectId = 'rembrandt2';
        beacon.objectTitle = 'Das ICE Gemälde 1';
        beacon.objectPainter = 'Rembrandt';
        beacon.objectURL = 'https://en.wikipedia.org/wiki/Philosopher_in_Meditation';
        beacon.soundFile = 'assets/sounds/Rembrandt_Selbstbildnis_als_der_verlorene_ Sohn_im_Wirtshaus.mp3';
      } else if (this.beaconScannerService.isMintBeacon(beacon)) {
        beacon.objectId = 'rembrandt3';
        beacon.objectTitle = 'Das MINT Gemälde 1';
        beacon.objectPainter = 'Rembrandt';
        beacon.objectURL = 'https://en.wikipedia.org/wiki/Philosopher_in_Meditation';
        beacon.soundFile = 'assets/sounds/Rembrandt_Selbstbildnis_als_der_verlorene_ Sohn_im_Wirtshaus.mp3';
      }
      this.initializedBeaconsWithPaitingInformation = true;
    })
  }

  isBeaconInReach(beacon): boolean {
    return beacon.distance < 3;
  }

  showPaintingInfo(url: string): void {
    this.iab.create(url);
  }

  playPaintingInfo(id: string, soundFile: string): void {
    this.nativeAudio.preloadComplex(id, soundFile, 1, 1, 0).then(() => {
      this.nativeAudio.play(id).then(() => {
        this.playingInProgress = true;
      }, (error) => {
        this.playingInProgress = false;
      });
    }, (error) => {
      this.playingInProgress = false;
    });
  }

  stopPaintingInfo(id: string) {
    this.nativeAudio.stop(id).then(() => {}, () => {});
  }
}
