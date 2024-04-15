import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  CdkDragEnd,
} from '@angular/cdk/drag-drop';
import {
  AlertController,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { AuthenticationService } from 'src/app/authentication.service';
import { WelcomeModalPagePage } from 'src/app/modals/welcome-modal-page/welcome-modal-page.page';

@Component({
  selector: 'app-trash',
  templateUrl: './trash.page.html',
  styleUrls: ['./trash.page.scss'],
})
export class TrashPage implements OnInit {
  @ViewChild('recycleImage', { static: false }) recycleBinRef: ElementRef;
  @ViewChild('wasteImage', { static: false }) wasteBinRef: ElementRef;
  @ViewChild('hazardImage', { static: false }) hazardBinRef: ElementRef;

  @ViewChild('draggableImage') draggableImageRef: ElementRef;
  @ViewChild('draggableBanana') draggableBananaRef: ElementRef;
  @ViewChild('draggablePaint') draggablePaintRef: ElementRef;

  recycleBinRect: DOMRect;
  wasteBinRect: DOMRect;
  hazardBinRect: DOMRect;

  paperRect: DOMRect | undefined;

  constructor() {}

  async ngOnInit() {}

  ngAfterViewInit() {
    this.setRecycleBinRect();
    this.setWasteBinRect();
    this.setHazardBinRect();
  }

  drop(itemName: string) {
    console.log(`Drop method triggered.`);
    console.log(`${itemName} reached the bin.`);
    console.log(`${itemName} Rect:`, this.paperRect);
    console.log(`Recycle Bin Rect:`, this.recycleBinRect);
    console.log(`Waste Bin Rect:`, this.wasteBinRect);
    console.log(`Hazard Bin Rect:`, this.hazardBinRect);
  }

  dragEnd(itemName: string) {
    console.log(`Drag end triggered. Item: ${itemName}`);

    const recycleBinRect =
      this.recycleBinRef.nativeElement.getBoundingClientRect();
    const wasteBinRect = this.wasteBinRef.nativeElement.getBoundingClientRect();
    const hazardBinRect =
      this.hazardBinRef.nativeElement.getBoundingClientRect();
    let itemRect;

    if (itemName === 'paper') {
      itemRect = this.draggableImageRef.nativeElement.getBoundingClientRect();
    } else if (itemName === 'banana') {
      itemRect = this.draggableBananaRef.nativeElement.getBoundingClientRect();
    } else if (itemName === 'paint') {
      itemRect = this.draggablePaintRef.nativeElement.getBoundingClientRect();
    }

    if (!itemRect || !recycleBinRect || !wasteBinRect || !hazardBinRect) {
      console.error('Item or bin rect is undefined.');
      return;
    }

    const recycleBinOverlap =
      itemRect.left < recycleBinRect.right &&
      itemRect.right > recycleBinRect.left &&
      itemRect.top < recycleBinRect.bottom &&
      itemRect.bottom > recycleBinRect.top;

    const wasteBinOverlap =
      itemRect.left < wasteBinRect.right &&
      itemRect.right > wasteBinRect.left &&
      itemRect.top < wasteBinRect.bottom &&
      itemRect.bottom > wasteBinRect.top;

    const hazardBinOverlap =
      itemRect.left < hazardBinRect.right &&
      itemRect.right > hazardBinRect.left &&
      itemRect.top < hazardBinRect.bottom &&
      itemRect.bottom > hazardBinRect.top;

    if (recycleBinOverlap) {
      console.log(
        `Overlap detected. Item: ${itemName} reached the recycle bin.`
      );
    } else if (wasteBinOverlap) {
      console.log(`Overlap detected. Item: ${itemName} reached the waste bin.`);
    } else if (hazardBinOverlap) {
      console.log(
        `Overlap detected. Item: ${itemName} reached the hazard bin.`
      );
    }
  }

  setPaperRect(event: any) {
    this.paperRect = event.source.element.nativeElement.getBoundingClientRect();
  }

  setRecycleBinRect() {
    if (this.recycleBinRef) {
      const recycleBinElement = this.recycleBinRef.nativeElement;
      const recycleBinRect = recycleBinElement.getBoundingClientRect();
      // Now you have the bounding client rect of the recycle bin element
      console.log('Recycle bin rect:', recycleBinRect);
    }
  }

  setWasteBinRect() {
    if (this.wasteBinRef) {
      const wasteBinElement = this.wasteBinRef.nativeElement;
      const wasteBinRect = wasteBinElement.getBoundingClientRect();
      console.log('Waste bin rect:', wasteBinRect);
    }
  }

  setHazardBinRect() {
    if (this.hazardBinRef) {
      const hazardBinElement = this.hazardBinRef.nativeElement;
      const hazardBinRect = hazardBinElement.getBoundingClientRect();
      console.log('Hazard bin rect:', hazardBinRect);
    }
  }
}
