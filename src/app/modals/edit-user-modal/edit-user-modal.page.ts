import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  ModalController,
  ToastController,
  AlertController,
  LoadingController,
} from '@ionic/angular';
import { AuthenticationForParentsService } from 'src/app/authenticationParents/authentication-for-parents.service';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface BMIRecord {
  date: string;
  bmi: number;
}

interface UserData {
  parentUID?: string;
  fullname?: string;
  email?: string;
  age?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  status?: string;
  usersUID?: string;
  bmiHistory?: BMIRecord[];
  // Add other properties as needed
}

@Component({
  selector: 'app-edit-user-modal',
  templateUrl: './edit-user-modal.page.html',
  styleUrls: ['./edit-user-modal.page.scss'],
})
export class EditUserModalPage implements OnInit {
  @Input() userData: UserData;
  userInputDate: string;
  unsavedChanges: boolean = false;

  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore,
    private authService: AuthenticationForParentsService,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    this.initializeUserData(); // Call the method to initialize user data
    await this.getUserData(); // Retrieve user data, including bmiHistory
    this.calculateBMI(); // Calculate BMI when the page initializes
  }

  private initializeUserData() {
    // Ensure that the userData and bmiHistory properties are initialized
    this.userData = this.userData || {};
    this.userData.bmiHistory = this.userData.bmiHistory || [];
  }

  private async getUserData(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        console.log('Getting user data for usersUID:', this.userData.usersUID);

        const parentUID = await this.authService.getCurrentParentUID();
        const userDocRef = this.firestore
          .collection('parents')
          .doc(parentUID)
          .collection('users')
          .doc(this.userData.usersUID);

        const userDoc$ = userDocRef.snapshotChanges().pipe(
          map((snapshot) => {
            const data = snapshot.payload.data() as UserData;
            const exists = snapshot.payload.exists;
            return { data, exists };
          })
        );

        userDoc$.subscribe(({ data, exists }) => {
          console.log('UserDoc:', data);

          if (exists) {
            this.userData = data;
            this.userData.bmiHistory = this.userData.bmiHistory || [];
          }

          resolve(); // Resolve the promise after data is loaded
        });
      } catch (error) {
        console.error('Error retrieving user data:', error);
        reject(error); // Reject the promise in case of an error
      }
    });
  }

  async saveUser() {
    let loading; // Declare loading variable here

    try {
      // Check if BMI history is empty
      if (!this.userData.bmiHistory || this.userData.bmiHistory.length === 0) {
        this.presentToast('Please add BMI history before saving user data.');
        return;
      }

      // Show loading indicator while saving
      loading = await this.loadingController.create({
        message: 'Saving user data...',
      });
      await loading.present();

      // Calculate BMI
      await this.calculateBMI();

      const parentUID = await this.authService.getCurrentParentUID();
      const usersCollectionRef = this.firestore
        .collection('parents')
        .doc(parentUID)
        .collection('users');

      // Update the document with the edited user data in the users subcollection
      await usersCollectionRef.doc(this.userData?.usersUID).update({
        ...this.userData,
      });

      // Also update the user document in the users collection
      const userCollectionRef = this.firestore.collection('users');
      await userCollectionRef.doc(this.userData?.usersUID).update({
        ...this.userData,
      });

      // Close the loading indicator
      await loading.dismiss();

      // Show success message
      const alert = await this.alertController.create({
        header: 'Success',
        message: 'User data updated successfully.',
        buttons: ['OK'],
      });
      await alert.present();

      // Close the modal after saving changes
      this.modalController.dismiss();
    } catch (error) {
      console.error('Error updating user data:', error);
      // Close the loading indicator on error
      if (loading) {
        await loading.dismiss();
      }
      // Show error message
      const alert = await this.alertController.create({
        header: 'Error',
        message:
          'An error occurred while updating user data. Please try again.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async addManualBMI() {
    try {
      await this.calculateBMI();

      if (!this.userInputDate) {
        this.presentToast(
          'Please choose a date before adding a manual BMI record.'
        );
        return;
      }

      if (this.userInputDate) {
        const inputDate = new Date(this.userInputDate);
        if (!isNaN(inputDate.getTime())) {
          const formattedDate = this.userInputDate;

          this.userData.bmiHistory = this.userData.bmiHistory || [];

          const existingRecordIndex = this.userData.bmiHistory.findIndex(
            (record) => record.date === formattedDate
          );

          if (existingRecordIndex !== -1) {
            this.userData.bmiHistory[existingRecordIndex].bmi =
              this.userData.bmi;
          } else {
            this.userData.bmiHistory.push({
              date: formattedDate,
              bmi: this.userData.bmi,
            });
          }

          this.unsavedChanges = true;

          // Log the usersUID when adding a manual BMI record
          console.log('UsersUID:', this.userData.usersUID);

          this.userInputDate = '';
        } else {
          console.error('Invalid date format. Please enter a valid date.');
        }
      } else {
        console.error('User input date is required.');
      }
    } catch (error) {
      console.error('Error adding manual BMI record:', error);
    }
  }

  async confirmCloseModal() {
    const alert = await this.alertController.create({
      header: 'Unsaved Changes',
      message:
        'You have unsaved changes. Are you sure you want to close without saving?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Close',
          handler: () => {
            // Dismiss the modal without saving changes
            this.modalController.dismiss();
          },
        },
      ],
    });
    await alert.present();
  }

  async presentToast(
    message: string,
    color: string = 'success',
    duration: number = 3000
  ) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: color,
      animated: true,
      position: 'bottom',
    });
    toast.present();
  }

  calculateBMI() {
    const { age, height, weight } = this.userData;

    if (age && height && weight) {
      const heightInMeters = height / 100;
      const weightInKilograms = weight;
      const bmi = weightInKilograms / (heightInMeters * heightInMeters);

      this.userData.bmi = Math.round(bmi * 100) / 100;

      if (bmi < 18.5) {
        this.userData.status = 'Underweight';
      } else if (bmi < 25) {
        this.userData.status = 'Healthy Weight';
      } else if (bmi < 30) {
        this.userData.status = 'Overweight';
      } else {
        this.userData.status = 'Obesity';
      }
    }
  }

  handleInputChange() {
    this.calculateBMI();
  }

  close() {
    if (this.unsavedChanges) {
      this.confirmCloseModal();
    } else {
      this.modalController.dismiss();
    }
  }
  async deleteBMIRecord(index: number) {
    let loading;

    try {
      const alert = await this.alertController.create({
        header: 'Confirm Delete',
        message: 'Are you sure you want to delete this BMI record?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Delete',
            handler: async () => {
              // Show loading indicator while deleting
              loading = await this.loadingController.create({
                message: 'Deleting BMI record...',
              });
              await loading.present();

              // Remove the BMI record from the local array
              this.userData.bmiHistory.splice(index, 1);

              // Update the Firestore document without the deleted BMI record
              const parentUID = await this.authService.getCurrentParentUID();
              const userDocRef = this.firestore
                .collection('parents')
                .doc(parentUID)
                .collection('users')
                .doc(this.userData.usersUID);

              // Update the document with the edited user data in the users subcollection
              await userDocRef.update({
                bmiHistory: this.userData.bmiHistory,
              });

              console.log('BMI Record deleted successfully.');

              // Close the loading indicator
              await loading.dismiss();

              this.presentToast(
                'BMI Record deleted successfully.',
                'success',
                3000
              );
            },
          },
        ],
      });

      await alert.present();
    } catch (error) {
      console.error('Error deleting BMI record:', error);
      // Close the loading indicator on error
      if (loading) {
        await loading.dismiss();
      }
      this.presentToast(
        'Error deleting BMI record. Please try again.',
        'danger',
        3000
      );
      // Handle the error as needed
    }
  }
}
