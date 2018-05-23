import {Component} from '@angular/core';
import {BeaconScannerService} from "../services/beaconscanner.service";

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {

  beaconList;

  constructor(private beaconScannerService: BeaconScannerService) {
  }

  ionViewWillEnter(): void {
    if (this.beaconScannerService.scanningInProgress) {
      this.beaconScannerService.startScanningForBeacons();
    }

    this.getBeaconList();

    // Timer that refreshes the beacon list.
    setInterval(() => this.getBeaconList(), 1000);
  }

  getBeaconList() {
    let unsortedBeaconList = this.beaconScannerService.getBeaconList();
    this.beaconList = this.beaconScannerService.sortBeaconList(unsortedBeaconList);
  }
}
