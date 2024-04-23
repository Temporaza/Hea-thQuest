import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { PetNamePageRoutingModule } from './pet-name-routing.module';

import { PetNamePage } from './pet-name.page';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    PetNamePageRoutingModule,
  ],
  declarations: [PetNamePage],
})
export class PetNamePageModule {}
