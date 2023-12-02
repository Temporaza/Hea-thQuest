import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { VaccineDetailsModalPage } from 'src/app/modals/vaccine-details-modal/vaccine-details-modal.page';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationForParentsService } from 'src/app/authenticationParents/authentication-for-parents.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-vaccination',
  templateUrl: './vaccination.page.html',
  styleUrls: ['./vaccination.page.scss'],
})
export class VaccinationPage implements OnInit {

  checkedVaccines: number[] = []; //for saving checklist

  async ngOnInit() {
    const loading = await this.loadingControler.create({
      message: 'Loading...',  // Customize the loading message
    });
    
     // Retrieve the checked state from Firestore
     try {
      await loading.present();
  
      const user = await this.authService.getProfile();
      if (user) {
        const userId = user.uid;
  
        const parentDoc = await this.firestore.collection('parents').doc(userId).get().toPromise();
  
        if (parentDoc.exists) {
          const data = parentDoc.data() as { checkedVaccines: number[] };
          this.checkedVaccines = data.checkedVaccines || [];
        }
      }
    } catch (error) {
      console.error('Error fetching parent document:', error);
    } finally {
      await loading.dismiss();  // Dismiss the loading indicator regardless of success or error
    }
  }
  private vaccineDetailsData = [
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

  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore,
    private authService: AuthenticationForParentsService,
    private router: Router,
    private loadingControler: LoadingController
    ) { }

    navigateToSignup() {
      this.router.navigate(['/signup']); // Use the appropriate route path
    }
    
    isRegisterButtonDisabled() {
      // Check if all 8 checkboxes are checked
      return this.checkedVaccines.length !== 8;
    }

  async showDetails(vaccineNumber: number) {
    const vaccineDetails = this.getVaccineDetails(vaccineNumber); // Replace with your method to fetch vaccine details

    if (!vaccineDetails) {
      // Handle the case where vaccine details are not found
      console.error('Vaccine details not found for vaccine number:', vaccineNumber);
      return;
    }  

    const modal = await this.modalController.create({
      component: VaccineDetailsModalPage,
      componentProps:{
        vaccineNumber: vaccineNumber,
      },
    });

    return await modal.present();
  }
  
  getVaccineDetails(vaccineNumber: number) {
    // Find the vaccine details with the matching vaccineNumber
    return this.vaccineDetailsData.find((vaccine) => vaccine.number === vaccineNumber);
  }

  updateCheckedVaccines(event, vaccineNumber: number) {
    if (event.detail.checked) {
      this.checkedVaccines.push(vaccineNumber);
    } else {
      const index = this.checkedVaccines.indexOf(vaccineNumber);
      if (index > -1) {
        this.checkedVaccines.splice(index, 1);
      }
    }

  }

  async saveCheckedVaccines() {
    const user = await this.authService.getProfile();
    const userId = user.uid;
    
    // Show loading indicator
    const loading = await this.loadingControler.create({
      message: 'Saving...',
    });
    await loading.present();
  
    try {
      // Update the parent's document in Firestore with the checked vaccines
      const parentDoc = this.firestore.collection('parents').doc(userId);
      await parentDoc.update({ checkedVaccines: this.checkedVaccines });
    } catch (error) {
      console.error('Error saving checked vaccines:', error);
      // Handle the error, e.g., show an alert to the user
    } finally {
      // Dismiss the loading indicator
      await loading.dismiss();
    }
  }

}
