import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { KidsProgressPageRoutingModule } from './kids-progress-routing.module';

import { KidsProgressPage } from './kids-progress.page';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    KidsProgressPageRoutingModule,
   
  ],
  declarations: [
    KidsProgressPage
  ]
})
export class KidsProgressPageModule {}
