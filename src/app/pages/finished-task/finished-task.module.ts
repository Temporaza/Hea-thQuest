import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinishedTaskPageRoutingModule } from './finished-task-routing.module';

import { FinishedTaskPage } from './finished-task.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinishedTaskPageRoutingModule
  ],
  declarations: [FinishedTaskPage]
})
export class FinishedTaskPageModule {}
