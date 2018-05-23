import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {BeaconScannerService} from "../services/beaconscanner.service";
import _ from "lodash";

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  selectedItem: any;
  icons: string[];
  items: Array<{title: string, note: string, icon: string}>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private beaconScannerService: BeaconScannerService) {

  }

  ionViewWillEnter():void {
    if (this.beaconScannerService.scanningInProgress) {
      this.beaconScannerService.startScanningForBeacons();
    }

    // Timer that refreshes the beacon list.
    setInterval(this.getBeaconList, 2000);
  }

  getBeaconList() {
    let beacons = this.beaconScannerService.getBeaconList();
    _.forEach(beacons, (beacon) => {
      beacon.mappedBeaconRSSI = this.mapBeaconRSSI(beacon.rssi);
    });

    return _.sortBy(beacons, 'mappedBeaconRSSI').reverse();
  }

  // see https://github.com/evothings/cordova-eddystone/blob/master/example/index.html
  // Map the RSSI value to a value between 1 and 100.
  mapBeaconRSSI(rssi) {
    if (rssi >= 0) return 1; // Unknown RSSI maps to 1.
    if (rssi < -100) return 100; // Max RSSI
    return 100 + rssi;
  }
}
