import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { timer } from 'rxjs/observable/timer';

// am adaugat aici home page si am  scos tabs page
//import { TabsPage } from '../pages/tabs/tabs';
import { HomePage } from '../pages/home/home';
// end change

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
    //am schimbat mai jos din TabsPage in HomePage
  rootPage:any = HomePage;

  //am schimbat mai jos din TabsPage in HomePage
  rootPage:any = HomePage;

  showSplash = true; // <-- show animation


  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      timer(5000).subscribe(() => this.showSplash = false); // <-- hide animation after 3s

    });
  }
}
