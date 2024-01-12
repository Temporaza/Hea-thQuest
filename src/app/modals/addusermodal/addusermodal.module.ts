import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddusermodalPageRoutingModule } from './addusermodal-routing.module';

import { AddusermodalPage } from './addusermodal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddusermodalPageRoutingModule
  ],
  declarations: [AddusermodalPage]
})
export class AddusermodalPageModule {}
