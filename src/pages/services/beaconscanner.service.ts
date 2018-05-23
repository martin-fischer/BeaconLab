import {Injectable} from "@angular/core";
import {Platform} from "ionic-angular";

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
    let beacons = this.beaconData;

    var beaconList = [];
    for (var key in beacons) {
      beaconList.push(beacons[key]);
    }
    return beaconList;
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
        data.voucherBeacon = this.isIceBeacon(data) && this.isInReach(data);
        data.paintingBeacon = this.isBlueberryBeacon(data) && this.isInReach(data);
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
}