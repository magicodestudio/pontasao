import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Platform } from 'ionic-angular';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';

import { NFC } from "@ionic-native/nfc";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {


  granted: boolean;
  denied: boolean;
  scanned: boolean;
  tagId: string;


  responseObj:any;
  watchLocationUpdates:any; 
  //loading:any;
  isWatching:boolean;

  //Geocoder configuration
  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };
  


  constructor(
    public navCtrl: NavController,
    //public loadingCtrl: LoadingController,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder, 
    private nfc: NFC
    ) {

      //Custome object to save information returned
      this.responseObj = {
        latitude:0,
        longitude:0,
        accuracy:0,
        address:""
      };

      this.resetScanData();
  }
/*
  //Show UI loader of ionic
  showLoader(){
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
  }
  
  //Hide UI loader of ionic
  hideLoader(){
    this.loading.dismiss();
  }*/

  //Get current coordinates of device
  getGeolocation(){
   // this.showLoader();
    this.geolocation.getCurrentPosition().then((resp) => {
      this.responseObj = resp.coords; 
      //this.hideLoader();
      this.getGeoencoder(this.responseObj.latitude,this.responseObj.longitude);
     }).catch((error) => {
       alert('Error getting location'+ JSON.stringify(error));
     //  this.hideLoader();
     });
  }

  //geocoder method to fetch address from coordinates passed as arguments
  getGeoencoder(latitude,longitude){
   // this.showLoader();
    this.nativeGeocoder.reverseGeocode(latitude, longitude, this.geoencoderOptions)
    .then((result: NativeGeocoderReverseResult[]) => {
      this.responseObj.address = this.generateAddress(result[0]);
      //this.hideLoader();
    })
    .catch((error: any) => {
      alert('Error getting location'+ JSON.stringify(error));
     // this.hideLoader();
    });
  }

  //Return Comma saperated address
  generateAddress(addressObj){
      let obj = [];
      let address = "";
      for (let key in addressObj) {
        obj.push(addressObj[key]);
      }
      obj.reverse();
      for (let val in obj) {
        if(obj[val].length)
        address += obj[val]+', ';
      }
    return address.slice(0, -2);
  }


  //Start location update watch
  watchLocation(){
   // this.showLoader();
    this.isWatching = true;
    this.watchLocationUpdates = this.geolocation.watchPosition();
    this.watchLocationUpdates.subscribe((resp) => {
      //alert(JSON.stringify(resp));
    //  this.hideLoader();
      this.responseObj = resp.coords;
      this.getGeoencoder(this.responseObj.latitude,this.responseObj.longitude);
      // resp can be a set of coordinates, or an error (if an error occurred).
      // resp.coords.latitude
      // resp.coords.longitude
    });
  }

  //Stop location update watch
  stopLocationWatch(){
    this.isWatching = false;
    this.watchLocationUpdates.unsubscribe();
  }


  //NFC PART - default code
  resetScanData() {
    this.granted = false;
    this.scanned = false;
    this.tagId = "";
  }

  ionViewDidEnter() {
    this.nfc.enabled().then((resolve) => {
      this.addListenNFC();
    }).catch((reject) => {
      alert("NFC is not supported by your Device");
    });
  }

  addListenNFC() {

    this.nfc.addTagDiscoveredListener(nfcEvent => this.sesReadNFC(nfcEvent.tag)).subscribe(data => {
      if (data && data.tag && data.tag.id) {
        let tagId = this.nfc.bytesToHexString(data.tag.id);
        if (tagId) {
          this.tagId = JSON.stringify(data);//tagId;
          this.scanned = true;

          // only testing data consider to ask web api for access
          //this.granted = [
          //  "7d3c6179"
          //].indexOf(tagId) != -1;

          //am modificat tagId sa nu fie doar id ci am vrut sa citesc tot tag-ul, posibil sa nu fie asta calea (oricum noua ne trebuie doar ID-ul dar nah...)

        } else {
          alert('NFC_NOT_DETECTED');
        }
      }
    });
  }

  sesReadNFC(data): void {

  }

  failNFC(err) {
    alert("Error while reading: Please Retry");
  }

}
