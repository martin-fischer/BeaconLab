import {Component, ViewChild} from '@angular/core';
import {BeaconScannerService} from "../services/beaconscanner.service";
import {BeaconCoordinate} from "../services/datatypes/coordinate.type";
import {Chart} from 'chart.js';

@Component({
  selector: 'page-navigation',
  templateUrl: 'navigation.html'
})

export class NavigationPage {

  @ViewChild('bubbleCanvas') bubbleCanvas;
  bubbleChart: any;
  currentPosition: BeaconCoordinate = new BeaconCoordinate();
  beaconList;
  blueberryPosition: BeaconCoordinate = {x: 0, y:0};
  mintPosition: BeaconCoordinate = {x: 7, y:1};
  icePosition: BeaconCoordinate = {x: 5, y:5};

  constructor(private beaconScannerService: BeaconScannerService) {
  }

  ionViewWillEnter() {
    if (this.beaconScannerService.scanningInProgress) {
      this.beaconScannerService.startScanningForBeacons();
    }

    // Timer that refreshes the beacon list.
    setInterval(() => this.getCurrentPosition(), 1000);

    //this.drawChart();
  }

  ionViewDidLoad() {
    //this.drawChart();
  }


  getCurrentPosition() {

    let unsortedBeaconList = this.beaconScannerService.getBeaconList();
    this.beaconList = this.beaconScannerService.sortBeaconList(unsortedBeaconList);


    this.currentPosition = this.beaconScannerService.calculateCurrentPosition(this.beaconList, this.blueberryPosition, this.mintPosition, this.icePosition);
    this.drawChart(this.currentPosition);
  }

  drawChart(currentPosition: BeaconCoordinate) {
    this.bubbleChart = new Chart(this.bubbleCanvas.nativeElement, {

      type: 'bubble',
      data: {
        datasets: [{
          data: [
            {x: 0, y: 0, r: 2},
            {x: 17, y: 0, r: 2},
            {x: 0, y: 7, r: 2},
            {x: 17, y: 7, r: 2},
            {x: this.blueberryPosition.x, y: this.blueberryPosition.y, r: 5},
            {x: this.mintPosition.x, y: this.mintPosition.y, r: 5},
            {x: this.icePosition.x, y: this.icePosition.y, r: 5},
            {x: currentPosition.x, y: currentPosition.y, r: 12}],
          backgroundColor: [
            'rgba(10, 10, 10, 0.2)',
            'rgba(10, 10, 10, 0.2)',
            'rgba(10, 10, 10, 0.2)',
            'rgba(10, 10, 10, 0.2)',
            'rgba(153, 51, 153, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(102, 204, 255, 0.2)',
            'rgba(255, 0, 0, 0.2)',
          ],
          borderColor: [
            'rgba(0,0,0,1)',
            'rgba(0,0,0,1)',
            'rgba(0,0,0,1)',
            'rgba(0,0,0,1)',
            'rgba(115, 38, 115)',
            'rgba(75, 192, 192, 1)',
            'rgba(0, 170, 255, 1)',
            'rgba(204, 0, 0, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        animation: false,
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }

    });
  }
}
