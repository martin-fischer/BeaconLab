import {Injectable} from "@angular/core";
import {Platform} from "ionic-angular";
import {BeaconCoordinate} from "./datatypes/coordinate.type";
import _ from "lodash";

declare var evothings: any;
declare var cordova: any;

@Injectable()
export class BeaconScannerService {

  BLUEBERRY_BEACON = 'a0cee54c0b49';
  MINT_BEACON = '48058592a6c9';
  ICE_BEACON = '63243aedf681';

  scanningInProgress: boolean = true;
  isInForeground: boolean = true;
  beaconData: Map<string, any> = new Map();

  constructor(private platform: Platform) {}

  getBeaconList() {

    this.removeOldBeacons();

    let beacons = this.beaconData;
    var beaconList = [];
    for (var key in beacons) {
      beaconList.push(beacons[key]);
    }
    return beaconList;
  }

  removeOldBeacons() {
    var timeNow = Date.now();
    for (var key in this.beaconData) {
      // Only show beacons updated during the last 10 seconds.
      var beacon = this.beaconData[key];
      if (beacon.timestamp + 10000 < timeNow) {
        delete this.beaconData[key];
      }
    }
  }

  sortBeaconList(beacons) {
    _.forEach(beacons, (beacon) => {
      beacon.mappedBeaconRSSI = this.mapBeaconRSSI(beacon.rssi);
    });

    return _.sortBy(beacons, 'mappedBeaconRSSI').reverse();
  }

  // see https://github.com/evothings/cordova-eddystone/blob/master/example/index.html
  // Map the RSSI value to a value between 1 and 100.
  private mapBeaconRSSI(rssi) {
    if (rssi >= 0) return 1; // Unknown RSSI maps to 1.
    if (rssi < -100) return 100; // Max RSSI
    return 100 + rssi;
  }

  startScanningForBeacons() {
    this.platform.ready().then(() => {
      this.scanningInProgress = true;
      evothings.eddystone.startScan((data) => {

        if (!this.isInForeground) {

          if (this.beaconData[data.address] && !this.beaconData[data.address].notified) {
            data.notified = true;

            cordova.plugins.notification.local.schedule({
              title: 'Beacon found!',
              text: data.address,
              foreground: true
            });
          }
        }

        data.instanceId = this.uint8ArrayToString(data.bid);
        data.timestamp = Date.now();
        data.distance = evothings.eddystone.calculateAccuracy(data.txPower, data.rssi);
        this.addThumbnailAndDescription(data);
        this.beaconData[data.address] = data;
      })
    });
  }

  private addThumbnailAndDescription(data) {
    if (this.isBlueberryBeacon(data)) {
      data.thumbnail = 'assets/imgs/blueberry.jpg';
      data.description = 'BLUEBERRY';
    } else if (this.isMintBeacon(data)) {
      data.thumbnail = 'assets/imgs/mint.jpg';
      data.description = 'MINT';
    } else if (this.isIceBeacon(data)) {
      data.thumbnail = 'assets/imgs/ice.jpg';
      data.description = 'ICE';
    }
  }

  stopScanningForBeacons(): void {
    this.scanningInProgress = false;
    evothings.eddystone.stopScan();
    this.beaconData = new Map();
  }

  uint8ArrayToString(uint8Array) {
    function format(x) {
      var hex = x.toString(16);
      return hex.length < 2 ? '0' + hex : hex;
    }

    var result = '';
    for (var i = 0; i < uint8Array.length; ++i) {
      result += format(uint8Array[i]);
    }
    return result.trim();
  }

  isIceBeacon(data): boolean {
    return data.instanceId === this.ICE_BEACON;
  }

  isBlueberryBeacon(data): boolean {
    return data.instanceId === this.BLUEBERRY_BEACON;
  }

  isMintBeacon(data): boolean {
    return data.instanceId === this.MINT_BEACON
  }

  isInReach(data): boolean {
    return data.distance < 2;
  }

  calculateCurrentPosition(beaconList: Array<any>, blueberryPosition: BeaconCoordinate, mintPosition: BeaconCoordinate, icePosition: BeaconCoordinate): BeaconCoordinate {
    let currentPosition: BeaconCoordinate = new BeaconCoordinate();

    // static coordinates for our 3 beacons
    let blueberry_x = blueberryPosition.x;
    let blueberry_y = blueberryPosition.y;
    let blueberry_d = 0;
    let mint_x = mintPosition.x;
    let mint_y = mintPosition.y;
    let mint_d = 0;
    let ice_x = icePosition.x;
    let ice_y = icePosition.y;
    let ice_d = 0;

    // get distances from each beacon
    _.forEach(beaconList, (beacon) => {
      if (this.isIceBeacon(beacon)) {
        ice_d = beacon.distance;
      } else if (this.isBlueberryBeacon(beacon)) {
        blueberry_d = beacon.distance;
      } else if (this.isMintBeacon(beacon)) {
        mint_d = beacon.distance;
      }
    });

    if (mint_d > 0 && ice_d > 0 && blueberry_d > 0) {

      let A = (mint_x * mint_x) + (mint_y * mint_y) - (mint_d * mint_d);
      let B = (ice_x * ice_x) + (ice_y * ice_y) - (ice_d * ice_d);
      let C = (blueberry_x * blueberry_x) + (blueberry_y * blueberry_y) - (blueberry_d * blueberry_d);

      let X32 = blueberry_x - ice_x;
      let X13 = mint_x - blueberry_x;
      let X21 = ice_x - mint_x;
      let Y32 = blueberry_y - ice_y;
      let Y13 = mint_y - blueberry_y;
      let Y21 = ice_y - mint_y;

      // based on the formula from http://cdn.intechweb.org/pdfs/13525.pdf
      let x = ((A * Y32) + (B * Y13) + (C * Y21)) / (2 * ((mint_x * Y32) + (ice_x * Y13) + (blueberry_x * Y21)));
      let y = ((A * X32) + (B * X13) + (C * X21)) / (2 * ((mint_y * X32) + (ice_y * X13) + (blueberry_y * X21)));

      if (x == -Infinity || isNaN(x) || y == -Infinity || isNaN(y)) {
        currentPosition.x = mint_x;
        currentPosition.y = mint_y;
      }

      currentPosition.x = x;
      currentPosition.y = y;

      return (currentPosition);
    }
  }
}