import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ParentsAcitvityPageRoutingModule } from './parents-acitvity-routing.module';

import { ParentsAcitvityPage } from './parents-acitvity.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ParentsAcitvityPageRoutingModule
  ],
  declarations: [ParentsAcitvityPage]
})
export class ParentsAcitvityPageModule {}
