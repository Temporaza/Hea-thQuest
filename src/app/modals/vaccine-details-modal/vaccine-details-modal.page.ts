import { Component, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController, ModalController, NavController } from '@ionic/angular';


@Component({
  selector: 'app-vaccine-details-modal',
  templateUrl: './vaccine-details-modal.page.html',
  styleUrls: ['./vaccine-details-modal.page.scss'],
})
export class VaccineDetailsModalPage {

  @Input() baby: any;
  parentUID: string;

  constructor(
    private modalController: ModalController,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private navCtrl: NavController,
    private alertController: AlertController
    ) { }

    ngOnInit() {
      // Initialize the vaccines object
      if (!this.baby.vaccines) {
        this.baby.vaccines = {
          vaccine1: false,
          vaccine2: false,
          vaccine3: false,
          vaccine4: false,
          vaccine5: false,
          vaccine6: false,
          vaccine7: false,
          vaccine8: false,
        };
      }

      if (!this.baby.vaccineDates) {
        this.baby.vaccineDates = {
          vaccine1: null,
          vaccine2: null,
          vaccine3: null,
          vaccine4: null,
          vaccine5: null,
          vaccine6: null,
          vaccine7: null,
          vaccine8: null,
        };
      }
  
      // Check if the user is authenticated
      this.afAuth.authState.subscribe(user => {
        if (user) {
          this.parentUID = user.uid;
          console.log('Parent UID in Vaccine Details Modal:', this.parentUID);
        }
      });
    }

  closeModal() {
    this.modalController.dismiss();
  }

  async save() {
    console.log('Save button clicked'); // Check if this log appears in the console
  
    try {
      // Save the updated vaccine details to Firestore
      await this.saveVaccineDetailsToFirestore(this.baby);
      console.log('Vaccine details saved successfully'); // Check if this log appears in the console
    } catch (error) {
      console.error('Error saving vaccine details to Firestore:', error);
    }
  
    // Optionally, close the modal after saving
    this.modalController.dismiss();
  }
  
  private async saveVaccineDetailsToFirestore(baby: any) {
    try {
      const parentDoc = await this.firestore.collection('parents').doc(this.parentUID).get().toPromise();

      if (parentDoc.exists) {
        const babiesCollection = parentDoc.ref.collection('babies');
        await babiesCollection.doc(baby.name).update({
          vaccines: baby.vaccines,
          vaccineDates: baby.vaccineDates,
        });
        console.log('Vaccine details saved to Firestore successfully');
      } else {
        console.error('Parent document does not exist');
      }
    } catch (error) {
      console.error('Error saving vaccine details to Firestore:', error);
    }
  }

  isAllVaccinesChecked(): boolean {
    return (
      this.baby.vaccines.vaccine1 &&
      this.baby.vaccines.vaccine2 &&
      this.baby.vaccines.vaccine3 &&
      this.baby.vaccines.vaccine4 &&
      this.baby.vaccines.vaccine5 &&
      this.baby.vaccines.vaccine6 &&
      this.baby.vaccines.vaccine7 &&
      this.baby.vaccines.vaccine8
      // Add more conditions for other vaccines if needed
    );
  }

  async navigateToSignup(): Promise<void> {
    // Check if all vaccines are checked before navigating
    if (this.isAllVaccinesChecked()) {
      const alert = await this.alertController.create({
        header: 'Confirm Signup',
        message: 'Are you sure you want to proceed to signup?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
          },
          {
            text: 'Proceed',
            handler: () => {
              // Navigate to the signup page
              this.navCtrl.navigateForward('/signup').then(() => {
                // Close the modal after navigating to the signup page
                this.modalController.dismiss();
              });
            },
          },
        ],
      });

      await alert.present();
    } else {
      // Display an alert or perform some action if not all vaccines are checked
      console.log('Please complete all vaccine checks before proceeding to signup.');
    }
  }

}