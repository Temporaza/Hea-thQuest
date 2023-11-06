import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PendingDocPageRoutingModule } from './pending-doc-routing.module';

import { PendingDocPage } from './pending-doc.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PendingDocPageRoutingModule
  ],
  declarations: [PendingDocPage]
})
export class PendingDocPageModule {}
