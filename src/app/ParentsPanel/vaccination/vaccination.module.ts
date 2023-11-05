import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VaccinationPageRoutingModule } from './vaccination-routing.module';

import { VaccinationPage } from './vaccination.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VaccinationPageRoutingModule
  ],
  declarations: [VaccinationPage]
})
export class VaccinationPageModule {}
