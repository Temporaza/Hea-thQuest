import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DoctorRegisterPageRoutingModule } from './doctor-register-routing.module';

import { DoctorRegisterPage } from './doctor-register.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    DoctorRegisterPageRoutingModule
  ],
  declarations: [DoctorRegisterPage]
})
export class DoctorRegisterPageModule {}
