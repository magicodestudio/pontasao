import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
/**
 * Generated class for the IstoricPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-istoric',
  templateUrl: 'istoric.html',
})
export class IstoricPage {
    idul: any;
    sqlstorage: SQLiteObject;
    public itemz: any = [];
     public abc: any;
    
  constructor(private viewCtrl: ViewController, private navParams: NavParams) {
      
  }
    /*
     gogo(){
           
      this.sqlstorage.executeSql('SELECT card, time, date, status FROM pontaje WHERE card ="' + this.idul + '"  ORDER BY pid DESC LIMIT 10', []).then( res=>{
          //for(var i=0; i<res.rows.length; i++){
          this.abc=JSON.stringify(res.rows.item(0));
          istoricText += ' <br/> ' + JSON.stringify(res.rows.item(i));
              this.itemz.push({
                    card:res.rows.item(i).card,
                    time:res.rows.item(i).time,
                    date:res.rows.item(i).date,
                    status:res.rows.item(i).status
                });
               } 
            })
        .catch(e => console.log(e));
        
       
    }
*/
  ionViewDidLoad() {
    this.idul = this.navParams.get('tagIdTrimis');
      
      // functie de mutat pe pagina de istoric sa preia ultimele 10 intrari ale card-ului
   
     this.abc = this.idul;
    

      
  }
    
    inchideIstoric(){
        this.viewCtrl.dismiss();
    }
   

}
