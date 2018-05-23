import {Component} from '@angular/core';
import {BeaconScannerService} from "../services/beaconscanner.service";
import {BeaconCoordinate} from "../services/datatypes/coordinate.type";

@Component({
  selector: 'page-navigation',
  templateUrl: 'navigation.html'
})

export class NavigationPage {

  currentPosition: BeaconCoordinate = new BeaconCoordinate();
  beaconList;

  constructor(private beaconScannerService: BeaconScannerService) {
  }

  ionViewWillEnter() {
    if (this.beaconScannerService.scanningInProgress) {
      this.beaconScannerService.startScanningForBeacons();
    }

    // Timer that refreshes the beacon list.
    setInterval(() => this.getCurrentPosition(), 1000);
  }


  getCurrentPosition() {

    let unsortedBeaconList = this.beaconScannerService.getBeaconList();
    this.beaconList = this.beaconScannerService.sortBeaconList(unsortedBeaconList);


    this.currentPosition=this.beaconScannerService.calculateCurrentPosition(this.beaconList);
  }
}
