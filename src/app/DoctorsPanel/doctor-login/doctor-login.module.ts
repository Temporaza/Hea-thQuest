import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DoctorLoginPageRoutingModule } from './doctor-login-routing.module';

import { DoctorLoginPage } from './doctor-login.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    DoctorLoginPageRoutingModule
  ],
  declarations: [DoctorLoginPage]
})
export class DoctorLoginPageModule {}
