import {Component} from "@angular/core";
import {BeaconScannerService} from "../services/beaconscanner.service";

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  scanningInProgress: boolean;

  constructor(private beaconScannerService: BeaconScannerService) {}

  ionViewWillEnter():void {
    this.scanningInProgress = this.beaconScannerService.scanningInProgress;
  }

  updateScanningState() {
    if (this.beaconScannerService.scanningInProgress) {
      this.beaconScannerService.stopScanningForBeacons();
    } else {
      this.beaconScannerService.startScanningForBeacons();
    }
  }

}