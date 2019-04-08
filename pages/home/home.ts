import { Component, NgZone  } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Platform } from 'ionic-angular';
//import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';

import { NFC } from "@ionic-native/nfc";
import { Device } from '@ionic-native/device';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

import { Http } from '@angular/http';



//import { Toast } from '@ionic-native/toast';
import { ToastController } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { ModalController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {

  currentDate;
  formattedDate;
  formattedDateObj;
  unixTime;
  deviceUUID;
  bababiba;
  sqlstorage: SQLiteObject;
  items: any = [];
  itemsTrimis: any = [];
  schimbarea: string = 'start';
  zone;
  syncdata:any = {};
  loading: any;
  numedemo: string;

  granted: boolean;
  denied: boolean;
  scanned: boolean;
  tagId: string;


  responseObj:any;
  watchLocationUpdates:any; 
  //loading:any;
  isWatching:boolean;

/*  //Geocoder configuration
  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };
 */ 


  constructor(
    public navCtrl: NavController,
    //public loadingCtrl: LoadingController,
    private geolocation: Geolocation,
    //private nativeGeocoder: NativeGeocoder, 
    private nfc: NFC,
    private device: Device,
    public platform: Platform,

    private sqlite: SQLite,
    public toastCtrl: ToastController,
    private network: Network,
    public http: Http,
    public loadingController:LoadingController,
    private modalCtrl: ModalController,
     

    ) {

      //Custom object to save information returned
      this.responseObj = {
            latitude:0,
            longitude:0,
            accuracy:0,
            address:""
          };
      this.resetScanData();

      this.currentDate = new Date();
      this.getFormattedDate();
      this.unixTime = this.currentDate.getTime();
        
        
      // network on toast

      this.network.onConnect().subscribe(()=>{
        this.toastCtrl.create({
            message: 'Any type of network was detected',
            duration: 3000
        }).present();
      });
        // end network on toast    
    
      this.platform.ready().then(() => {     

          this.http = http;

          // network on toast
          this.network.onConnect().subscribe(()=>{
            this.toastCtrl.create({
                message: 'Any type of network was detected',
                duration: 3000
            }).present();
          });
  
          //read location
          this.getGeolocation();

          //read device UUID
          this.deviceUUID = this.device.uuid;

          this.zone = new NgZone({ enableLongStackTrace: false });

          this.sqlite.create({
            name: 'aliopontaj.db',
            location: 'default'
          }).then((db: SQLiteObject) => {
            this.sqlstorage = db;
            db.executeSql('CREATE TABLE IF NOT EXISTS pontaje (pid INTEGER PRIMARY KEY, device TEXT NOT NULL, card TEXT NOT NULL, numeledemo TEXT NOT NULL, gps TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, status TEXT NOT NULL, timestamp NUMERIC NOT NULL, synced INTEGER NOT NULL DEFAULT 0)', [])
            .then(res => {

              //demo purpose only - deleting the table - one time only this computer - testing
              db.executeSql('DELETE FROM pontaje', []).then(res => {}).catch(e => alert(JSON.stringify(e)));


            })
            .catch(e => alert(JSON.stringify(e)));
              
            this.refreshDBarray();

          }).catch(e => alert(JSON.stringify(e)));
          
      });

  }


  //Get current coordinates of device
  getGeolocation(){
    this.geolocation.getCurrentPosition().then((resp) => {
      this.responseObj = resp.coords; 
      //this.getGeoencoder(this.responseObj.latitude,this.responseObj.longitude);
    }).catch((error) => {
      alert('Error getting location'+ JSON.stringify(error));
    });
  }


  //NFC PART - default code ******************************************************************************************
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
          this.tagId = tagId;
          this.scanned = true;
          this.insertInDb();
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


  getFormattedDate() {
    var dateObj = new Date();
    var year = dateObj.getFullYear().toString();
    var month = dateObj.getMonth().toString();
    var date = dateObj.getDate().toString();

    var monthArray = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

    this.formattedDate = date + ' ' + monthArray[month] + ' ' + year;
    this.formattedDateObj = new Date(this.formattedDate);

  }

  getDayForInsert() {
    var dataazi = new Date(),
    cmonth = '' + (dataazi.getMonth() + 1),
    cday = '' + dataazi.getDate(),
    cyear = dataazi.getFullYear();
    if (cmonth.length < 2) cmonth = '0' + cmonth;
    if (cday.length < 2) cday = '0' + cday;
    return [cyear, cmonth, cday].join('-');
  }

  getTimeForInsert() {
    var dataazi = new Date(),
    chour = dataazi.getHours(),
    cminute = dataazi.getMinutes();
    return (chour < 10 ? '0' : '') + chour + ':' + (cminute < 10 ? '0' : '') + cminute;
  }

  getBeginEndOfDay(whattofetch) {
    var returnul = null;
    var acum = new Date();
    var ayear = acum.getUTCFullYear();
    var amonth = acum.getUTCMonth();
    var aday = acum.getUTCDate();

    var startHour = Math.floor(Date.UTC(ayear,amonth,aday,0,0,0,0));
    var endHour = Math.floor(Date.UTC(ayear,amonth,aday,23,59,59,0));

    switch (whattofetch) {
      case "begin":
        returnul = startHour;
        break;
      
      case "end":
        returnul = endHour;
        break;
    }

    return returnul;
  }


  refreshDBarray() {

      //alert('s-a apelat primenirea array');
      this.items = [];


      var startDay = this.getBeginEndOfDay('begin');
      var endDay = this.getBeginEndOfDay('end');
      this.sqlstorage.executeSql('SELECT distinct card FROM pontaje where timestamp between ' + startDay + ' and ' + endDay + ' ORDER BY pid DESC', [])
      .then(res => {
        
        for(var i=0; i<res.rows.length; i++) {
          //parcurgem fiecare card sa vedem ultima lui intrare
          this.sqlstorage.executeSql('SELECT * FROM pontaje where card="' + res.rows.item(i).card + '" ORDER BY pid DESC LIMIT 1', [])
          .then(res2 => {
            this.zone.run(()=>{
            for(var j=0; j<res2.rows.length; j++) {
              
              var numeledemo = '';

              if  ( res2.rows.item(j).card == '421d2deb' || 
                    res2.rows.item(j).card == '32a74cea' || 
                    res2.rows.item(j).card == '72ae62ea' ||
                    res2.rows.item(j).card == '22cabfea' ||
                    res2.rows.item(j).card == '82aba2e1' ) {
                numeledemo = 'Andrei'; 
              } else if  ( res2.rows.item(j).card == '82ed43eb' || 
                    res2.rows.item(j).card == 'f23187ea' || 
                    res2.rows.item(j).card == '42a8d1ea' ||
                    res2.rows.item(j).card == 'c23310e3' ||
                    res2.rows.item(j).card == '02a19be1' ) {
                numeledemo = 'Mihai'; 
              } else if  ( res2.rows.item(j).card == 'b2cb0aeb' || 
                    res2.rows.item(j).card == 'a25a4cea' || 
                    res2.rows.item(j).card == '92ef28ea' ||
                    res2.rows.item(j).card == '92c06eea' ||
                    res2.rows.item(j).card == '22c3fcea' ) {
                numeledemo = 'Elena'; 
              } else if  ( res2.rows.item(j).card == '12e211eb' || 
                    res2.rows.item(j).card == 'e2637dea' || 
                    res2.rows.item(j).card == '529a60ea' ||
                    res2.rows.item(j).card == '325130eb' ||
                    res2.rows.item(j).card == '0292e6ea' ) {
                numeledemo = 'Maria'; 
              } else if  ( res2.rows.item(j).card == 'd9872c4f' || 
                    res2.rows.item(j).card == 'd9872c4f' || 
                    res2.rows.item(j).card == 'd9872c4f' ||
                    res2.rows.item(j).card == 'd9872c4f' ||
                    res2.rows.item(j).card == 'd9872c4f' ) {
                numeledemo = 'Ionut'; 
              } else if  ( res2.rows.item(j).card == '023aed5a' || 
                    res2.rows.item(j).card == '023aed5a' || 
                    res2.rows.item(j).card == '023aed5a' ||
                    res2.rows.item(j).card == '023aed5a' ||
                    res2.rows.item(j).card == '023aed5a' ) {
                numeledemo = 'Alin'; 
              } else {
                numeledemo = 'Nealocat';
              }
                

              this.items.push({
                pid:res2.rows.item(j).pid,
                device:res2.rows.item(j).device,
                card:res2.rows.item(j).card,
                gps:res2.rows.item(j).gps,
                date:res2.rows.item(j).date,
                time:res2.rows.item(j).time,
                status:res2.rows.item(j).status,
                timestamp:res2.rows.item(j).timestamp,
                synced:res2.rows.item(j).synced,
                namedemo: numeledemo
              });

            }
            });
          })
          .catch(e => alert(JSON.stringify(e)));
          
        }
        //alert(JSON.stringify(res));
      })
      .catch(e => console.log(JSON.stringify(e)));
    

  }



  insertInDb() {

    var dataazi = new Date();
    var datadeinserat = this.getDayForInsert(); //get[cyear, cmonth, cday].join('-');
    var oradeinserat = this.getTimeForInsert(); //chour + ':' + cminute;
    this.schimbarea = 'start';


    //sa verificam daca exista vreo intrare astazi cu cardul asta
    var startDay = this.getBeginEndOfDay('begin');
    var endDay = this.getBeginEndOfDay('end');

    this.sqlstorage.executeSql('select * from pontaje where (timestamp between ' + startDay + ' and ' + endDay + ') and device="'+this.deviceUUID+'" and card="'+this.tagId+'" order by pid desc limit 1',[])
    .then(findu => {
      if (findu.rows.length > 0 ) {
        //we have a winner, return the pid        
        //verificare = findu.rows.item(0).status;
        
        if ( findu.rows.item(0).status == "start" ) {
          this.schimbarea = "stop";
        } else if( findu.rows.item(0).status == "stop" ) {
          this.schimbarea = "start";
        }

        //alert(this.schimbarea);
      }

      //alert("la sf functiei de verificare, status= "+this.schimbarea);


    this.sqlstorage.executeSql('INSERT into pontaje (device, card, gps, date, time, status, timestamp) values (?,?,?,?,?,?,?)',[this.deviceUUID,this.tagId, this.responseObj.latitude+','+this.responseObj.longitude, datadeinserat, oradeinserat, this.schimbarea, dataazi.getTime()])
    .then(res => {
      //insert is successful, we should rebuild array
      //alert("am inserat id: "+res['insertId']);


      // toast de confirmare citire

        if (this.schimbarea == 'stop') {
            this.toastCtrl.create({
                message: ' Pontajul a fost oprit',
                duration: 3000,
                cssClass: 'nfc_read_stop'
            }).present();

                  // end toast confirmare citire

         } else {
             this.toastCtrl.create({
                    message: ' Pontajul a fost pornit',
                    duration: 3000,
                    cssClass: 'nfc_read'
                }).present();
         }




      let arrayToSend = {
        device:     this.deviceUUID,
        card:       this.tagId,
        gps:        this.responseObj.latitude+','+this.responseObj.longitude, 
        date:       datadeinserat, 
        time:       oradeinserat, 
        status:     this.schimbarea, 
        timestamp:  dataazi.getTime(),
      };
      this.syncToServer(arrayToSend);
      this.refreshDBarray()

    })
    .catch(e => alert(JSON.stringify(e)));



    })
    .catch(e => alert(JSON.stringify(e)));

    
  }


  syncToServer(dataToSendToServer) {

    /*this.loading = this.loadingController.create({ 
      spinner: 'crescent',
      //duration: 2000,
      content: 'Sincronizare online...',
      cssClass: 'custom-class custom-loading'
    });
    this.loading.present();*/

    var link = 'https://my.scripting.work/pontaj/syncdata.php';
    var dateleTrimise = JSON.stringify(dataToSendToServer);
 
    this.http.post(link, dateleTrimise)
    .subscribe(data => {
        this.syncdata.response = data["_body"]; //https://stackoverflow.com/questions/39574305/property-body-does-not-exist-on-type-response
        /*this.toastCtrl.create({
                message: this.syncdata.response,
                duration: 8000
            }).present();
        this.loading.setContent("Sincronizare reusita!");
        setTimeout(() => {           
          this.loading.dismiss();
        },2000);*/

    }, error => {
        /*this.loading.setContent("Sincronizare esuata!");
        setTimeout(() => { 
          this.loading.dismiss();
        },2000);*/
    });

  }
    
    // creeaza o pagina in modal si trimite parametrul de card id  (care ar trebui schimbat cu name ca sa cuprinda taote id-urile) 
     istoricModal(event) {
        /*  var target = event.target || event.srcElement || event.currentTarget;
          var cidn = target.getElementsByTagName('h2')[0].innerHTML;*/
          this.sqlstorage.executeSql('SELECT card, time, date, status FROM pontaje WHERE card ="' + this.tagId + '"  ORDER BY pid DESC LIMIT 10', []).then( res=>{
          this.itemsTrimis =[];
              for(var i=0; i<res.rows.length; i++){
          //this.abc=JSON.stringify(res.rows.item(0));
          //istoricText += ' <br/> ' + JSON.stringify(res.rows.item(i));
               this.itemsTrimis.push({
                    card:res.rows.item(i).card,
                    time:res.rows.item(i).time,
                    date:res.rows.item(i).date,
                    status:res.rows.item(i).status
                });
              } 
      
       let profileModal = this.modalCtrl.create('IstoricPage', { tagIdTrimis : this.itemsTrimis });
       profileModal.present();  
          
          })
        .catch(e => console.log(e));
      
     }
    
    
    
    
}
