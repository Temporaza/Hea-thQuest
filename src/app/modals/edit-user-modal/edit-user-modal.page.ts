import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { AuthenticationForParentsService } from 'src/app/authenticationParents/authentication-for-parents.service';
import { map } from 'rxjs/operators';

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

  constructor(
    private modalController: ModalController,
    private firestore: AngularFirestore,
    private authService: AuthenticationForParentsService
  ) { }

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
  try {
    await this.calculateBMI();

    const parentUID = await this.authService.getCurrentParentUID();
    const usersCollectionRef = this.firestore
      .collection('parents')
      .doc(parentUID)
      .collection('users');

    // Log the parentUID and usersUID before the update

    // Update the document with the edited user data in the users subcollection
    await usersCollectionRef.doc(this.userData?.usersUID).update({
      ...this.userData, // Use the spread operator to include all properties
    });

    // Log a message after the update
    console.log('User data updated successfully.');

    // Also update the user document in the users collection
    const userCollectionRef = this.firestore.collection('users');
    await userCollectionRef.doc(this.userData?.usersUID).update({
      ...this.userData,
    });

    // Close the modal after saving changes
    this.modalController.dismiss();
  } catch (error) {
    console.error('Error updating user data:', error);
    // Handle the error as needed
  }
}

async addManualBMI() {
  try {
    await this.calculateBMI();

    if (this.userInputDate) {
      const inputDate = new Date(this.userInputDate);
      if (!isNaN(inputDate.getTime())) {
        const formattedDate = this.userInputDate;

        this.userData.bmiHistory = this.userData.bmiHistory || [];

        const existingRecordIndex = this.userData.bmiHistory.findIndex(record => record.date === formattedDate);

        if (existingRecordIndex !== -1) {
          this.userData.bmiHistory[existingRecordIndex].bmi = this.userData.bmi;
        } else {
          this.userData.bmiHistory.push({
            date: formattedDate,
            bmi: this.userData.bmi,
          });
        }

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
    this.modalController.dismiss();
  }

  async deleteBMIRecord(index: number) {
    try {
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
    } catch (error) {
      console.error('Error deleting BMI record:', error);
      // Handle the error as needed
    }
  }

}
