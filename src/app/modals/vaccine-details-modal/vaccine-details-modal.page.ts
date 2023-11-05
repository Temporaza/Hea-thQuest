import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-vaccine-details-modal',
  templateUrl: './vaccine-details-modal.page.html',
  styleUrls: ['./vaccine-details-modal.page.scss'],
})
export class VaccineDetailsModalPage implements OnInit {

  @Input() vaccineNumber: number;
  vaccineDetails: any;


  constructor(private modalController: ModalController) { }

  ngOnInit() {
    // Fetch vaccine details based on the vaccineNumber received
    this.vaccineDetails = this.getVaccineDetails(this.vaccineNumber);

  }
  dismissModal() {
    this.modalController.dismiss();
  }

  getVaccineDetails(vaccineNumber: number) {
    // Implement your logic to fetch vaccine details here or use the data provided
    // For simplicity, we'll use a static array similar to your vaccination.page.ts
    const vaccineDetailsData = [
      {
        number: 1,
        name: 'Vaccine 1',
        description: 'This is the first vaccine description.',
      },
      {
        number: 2,
        name: 'Vaccine 2',
        description: 'This is the second vaccine description.',
      },
      {
        number: 3,
        name: 'Vaccine 3',
        description: 'This is the third vaccine description.',
      },
      {
        number: 4,
        name: 'Vaccine 4',
        description: 'This is the fourth vaccine description.',
      },
      {
        number: 5,
        name: 'Vaccine 5',
        description: 'This is the fifth vaccine description.',
      },
      {
        number: 6,
        name: 'Vaccine 6',
        description: 'This is the six vaccine description.',
      },
      {
        number: 7,
        name: 'Vaccine 7',
        description: 'This is the seven vaccine description.',
      },
      {
        number: 8,
        name: 'Vaccine 8',
        description: 'This is the eight vaccine description.',
      },
      // Add more vaccine details as needed
    ];

    return vaccineDetailsData.find((vaccine) => vaccine.number === vaccineNumber);
  }

}
