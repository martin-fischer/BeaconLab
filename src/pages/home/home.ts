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

  nearestBeaconQueue = [];
  nearestBeacon;
  playingInProgress: boolean = false;
  initializedBeaconsWithPaitingInformation: boolean = false;

  readonly REACH_OF_VALID_BEACONS = 2; // we only want beacons within a distance of 2 meters
  readonly BEACON_QUEUE_MAX_SIZE = 8;

  constructor(private beaconScannerService: BeaconScannerService, private iab: InAppBrowser, private nativeAudio: NativeAudio) {
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
        beacon.objectId = 'rembrandt1';
        beacon.objectTitle = 'Die Rückkehr des verlorenen Sohnes';
        beacon.objectPainter = 'Rembrandt';
        beacon.objectArtStyle = 'Barock';
        beacon.objectURL = 'https://de.wikipedia.org/wiki/Die_R%C3%BCckkehr_des_verlorenen_Sohnes_(Rembrandt)';
        beacon.objectImageFile = 'assets/museum/imgs/rembrandt_sohn.jpg';
        beacon.objectSoundFile = 'assets/museum/sounds/Rembrandt_Selbstbildnis_als_der_verlorene_ Sohn_im_Wirtshaus.mp3';
      } else if (this.beaconScannerService.isIceBeacon(beacon)) {
        beacon.objectId = 'klimt1';
        beacon.objectTitle = 'Der Kuss';
        beacon.objectPainter = 'Gustav Klimt';
        beacon.objectArtStyle = 'Jugendstil';
        beacon.objectURL = 'https://de.wikipedia.org/wiki/Der_Kuss_(Klimt)';
        beacon.objectImageFile = 'assets/museum/imgs/klimt_der_kuss.jpg';
        beacon.objectSoundFile = '';
      } else if (this.beaconScannerService.isMintBeacon(beacon)) {
        beacon.objectId = 'monet1';
        beacon.objectTitle = 'Seerosenteich II';
        beacon.objectPainter = 'Claude Monet';
        beacon.objectArtStyle = 'Impressionismus';
        beacon.objectURL = 'https://www.kunstkopie.ch/a/claude-monet/seerosenteich-ii.html';
        beacon.objectImageFile = 'assets/museum/imgs/monet_seerosenteich.jpg';
        beacon.objectSoundFile = '';
      }
      this.initializedBeaconsWithPaitingInformation = true;
    })
  }

  isBeaconInReach(beacon): boolean {
    return beacon.distance < this.REACH_OF_VALID_BEACONS;
  }

  showPaintingInfo(url: string): void {
    this.iab.create(url);
  }

  stopAllSounds(): void {
    this.stopPaintingInfo('rembrandt1');
    this.stopPaintingInfo('klimt1');
    this.stopPaintingInfo('monet1');
    this.playingInProgress = false;
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
