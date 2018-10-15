import {Component} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {NativeAudio} from "@ionic-native/native-audio";
import _ from "lodash";
import {BeaconScannerService} from "../services/beaconscanner.service";

declare var cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  notificationFired: boolean = false;

  nearestBeaconQueue = [];
  nearestBeacon;
  playingInProgress: boolean = false;
  initializedBeaconsWithPaitingInformation: boolean = false;

  readonly REACH_OF_VALID_BEACONS = 2; // we only want beacons within a distance of 2 meters
  readonly BEACON_QUEUE_MAX_SIZE = 8;

  constructor(private beaconScannerService: BeaconScannerService, private iab: InAppBrowser, private nativeAudio: NativeAudio, private domSanitizer: DomSanitizer) {
  }

  ionViewWillEnter(): void {
    if (this.beaconScannerService.scanningInProgress) {
      this.beaconScannerService.startScanningForBeacons();
    }
    this.loadNearestBeacon();

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
        this.nearestBeaconQueue.push(nearestBeacon);
      }
      if (this.nearestBeaconQueue.length > this.BEACON_QUEUE_MAX_SIZE) {
        this.nearestBeaconQueue.shift();
      }

      this.nearestBeacon = this.getNearestBeaconFromQueue(this.nearestBeaconQueue);
      this.notifyIfAppIsInBackground();
    }
  }

  notifyIfAppIsInBackground() {
    if (!this.notificationFired && this.beaconScannerService.appPaused) {
      cordova.plugins.notification.local.schedule({
        title: 'Bildinformation anzeigen',
        text: this.nearestBeacon.objectTitle + ' (' + this.nearestBeacon.objectPainter + ')',
        attachments: ['file://' + this.nearestBeacon.objectImageFile],
        foreground: true
      });
      this.notificationFired = true;
    }
  }

  getNearestBeaconFromQueue(nearestBeaconQueue) {

    // sort by instance id
    let sortedByBeaconId = _.sortBy(nearestBeaconQueue, ['instanceId']);

    // make a map with a counter for each instance id
    let nearestBeaconDataMap = new Map();
    let prevBeacon = undefined;
    _.forEach(sortedByBeaconId, (beacon) => {
      if (prevBeacon === undefined || beacon.instanceId !== prevBeacon.instanceId) {
        nearestBeaconDataMap[beacon.instanceId] = 1;
      } else {
        nearestBeaconDataMap[beacon.instanceId] = nearestBeaconDataMap[beacon.instanceId] + 1;
      }
      prevBeacon = beacon;
    });

    // find the highest count
    let nearestBeaconInstanceId = undefined;
    let highestBeaconCounter = 0;
    for (var key in nearestBeaconDataMap) {
      if (nearestBeaconDataMap[key] > highestBeaconCounter) {
        nearestBeaconInstanceId = key;
        highestBeaconCounter = nearestBeaconDataMap[key];
      }
    };

    return _.find(nearestBeaconQueue, (beacon) => {
      return beacon.instanceId === nearestBeaconInstanceId;
    });
  }

  initializeBeaconsWithPaitingInformation(beaconList): void {
    _.forEach(beaconList, (beacon) => {
      if (this.beaconScannerService.isBlueberryBeacon(beacon)) {
        beacon.objectId = 'buetti1';
        beacon.objectTitle = 'Hey babe';
        beacon.objectPainter = 'Daniele Buetti';
        beacon.objectArtStyle = '2013, 173 x 143 cm Tintestrahldruck aufgezogen und laminiert Im Holzrahmen mit Abstandleiste Rahmenfarbe weiss';
        beacon.objectURL = 'https://kunst.mobiliar.ch/daniele-buetti/hey-babe';
        beacon.objectImageFile = 'assets/museum/imgs/hey_babe.jpg';
        beacon.objectSoundFile = 'assets/museum/sounds/Rembrandt_Selbstbildnis_als_der_verlorene_ Sohn_im_Wirtshaus.mp3';
        beacon.video = 'https://www.youtube.com/embed/Hq-Hn01E5k4';
      } else if (this.beaconScannerService.isIceBeacon(beacon)) {
        beacon.objectId = 'amiet1';
        beacon.objectTitle = 'Blumenstilleben';
        beacon.objectPainter = 'Cuno Amiet';
        beacon.objectArtStyle = '1954, 38 x 46.5 cm Öl auf Pavatex';
        beacon.objectURL = 'https://kunst.mobiliar.ch/cuno-amiet/blumenstilleben';
        beacon.objectImageFile = 'assets/museum/imgs/blumenstilleben.jpg';
        beacon.objectSoundFile = '';
      } else if (this.beaconScannerService.isMintBeacon(beacon)) {
        beacon.objectId = 'fleury1';
        beacon.objectTitle = 'Miracle';
        beacon.objectPainter = 'Sylvie Fleury';
        beacon.objectArtStyle = '2001, 12 x 100 x 5 cm Neon';
        beacon.objectURL = 'https://kunst.mobiliar.ch/sylvie-fleury/miracle-0';
        beacon.objectImageFile = 'assets/museum/imgs/miracle.jpg';
        beacon.objectSoundFile = '';
      }
      this.initializedBeaconsWithPaitingInformation = true;
    })
  }

  isBeaconInReach(beacon): boolean {
    return beacon.distance < this.REACH_OF_VALID_BEACONS;
  }

  showPaintingInfo(url: string): void {
    const iabOptions: any = {
      clearcache: 'yes',
      clearsessioncache: 'yes',
      hideurlbar: 'no',
      location:'yes',
      zoom:'yes'
    };

    this.iab.create(url, '_self', iabOptions);
  }

  stopAllSounds(): void {
    this.stopPaintingInfo('buetti1');
    this.stopPaintingInfo('amiet1');
    this.stopPaintingInfo('fleury1');
    this.playingInProgress = false;
  }

  showVideo(videoURL: string): void {
    const iabOptions: any = {
      clearcache: 'yes',
      clearsessioncache: 'yes',
      hideurlbar: 'no',
      location:'yes',
      zoom:'yes'
    };
    this.iab.create(videoURL, '_self', iabOptions);
  }

  getSecureVideoURL(videoURL: string): any {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(videoURL);
  }

  playPaintingInfo(id: string, soundFile: string): void {

    this.stopAllSounds();

    this.nativeAudio.preloadComplex(id, soundFile, 1, 1, 0).then(() => {
      this.playSoundFile(id);
    }, (error) => {
      this.playSoundFile(id);
    });
  }

  playSoundFile(id) {
    this.nativeAudio.play(id).then(() => {
      this.playingInProgress = true;
    }, (error) => {
      alert(error);
      this.playingInProgress = false;
    });
  }

  stopPaintingInfo(id: string) {
    this.nativeAudio.stop(id).then(() => {
      this.playingInProgress = false;
    }, () => {
      this.playingInProgress = true;
    });

  }
}
