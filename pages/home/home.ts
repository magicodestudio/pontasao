import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Platform } from 'ionic-angular';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {

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
    private nativeGeocoder: NativeGeocoder
    ) {

      //Custome object to save information returned
      this.responseObj = {
        latitude:0,
        longitude:0,
        accuracy:0,
        address:""
      };
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

}
