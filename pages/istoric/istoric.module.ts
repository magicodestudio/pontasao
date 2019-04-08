import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IstoricPage } from './istoric';

@NgModule({
  declarations: [
    IstoricPage,
  ],
  imports: [
    IonicPageModule.forChild(IstoricPage),
  ],
})
export class IstoricPageModule {}
