import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationService } from 'src/app/authentication.service';
import { PetBodyServiceService } from 'src/app/services/pet-body.service.service';
import { TaskStatusService } from 'src/app/services/task-status.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-market',
  templateUrl: './market.page.html',
  styleUrls: ['./market.page.scss'],
})
export class MarketPage implements OnInit {

  totalPoints: number = 0;

   // Properties to store download URLs
   petEyesUrl: string;
   petMouthUrl: string;
   petBodyUrl: string;


   selectedPetBodyUrl: string;

   
   //body parts
   duzzyUrl: string;
   big_YakUrl: string;
   curlyUrl: string;
   spikeyUrl: string;
   sumoUrl: string;
   wet_dogUrl: string;


   isDuzzyOwned: boolean = false;
   isBigYakOwned: boolean = false;
   isCurlyOwned: boolean = false;
   isSpikeyOwned: boolean = false;

  constructor(
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private authService: AuthenticationService,
    private petBodyService: PetBodyServiceService,
    private taskStatusService: TaskStatusService,
    private afAuth: AngularFireAuth,
   
  ) { }

  async ngOnInit() {
    try {
      // Get the current user
      const currentUser = await this.authService.getCurrentUser();
      // Log the user's information
      console.log('Current User:', currentUser);
      // Fetch the user's document from Firestore
      const userId = currentUser.uid;

      // Fetch total points using the user ID
      const totalPoints = await this.taskStatusService.getTotalPointsFromFirestore(userId);
       // Update the total points in the component
       this.totalPoints = totalPoints;

      const userDocRef = this.firestore.collection('users').doc(userId);
      // Use a snapshot to check if the document exists
      const userDocSnapshot = await userDocRef.get().toPromise();
  
      if (userDocSnapshot.exists) {
        // Extract user data from the document
        const userData = userDocSnapshot.data() as {
          petBodyUrl?: string; // Include other fields if needed
        };
  
        // If user data exists and contains a saved pet body URL, use it; otherwise, fetch the default URL
        this.petBodyUrl = userData && userData.petBodyUrl ? userData.petBodyUrl : 'default-pet-body-url';
  
        // Fetch other pet images
        this.petEyesUrl = await this.getDownloadUrl('mata', 'One.png');
        this.petMouthUrl = await this.getDownloadUrl('Mouth', 'M5.png');
        this.duzzyUrl = await this.getDownloadUrl('Body', 'Duzzy.png');
        this.big_YakUrl = await this.getDownloadUrl('Body', 'Big Yak.png');
        this.curlyUrl = await this.getDownloadUrl('Body', 'Curly.png');
        this.spikeyUrl = await this.getDownloadUrl('Body', 'Spikey.png');
        this.sumoUrl = await this.getDownloadUrl('Body', 'Sumo.png');
        this.wet_dogUrl = await this.getDownloadUrl('Body', 'WetDog.png');


       // Fetch the user's owned pet bodies from Firestore or another source
        const ownedPetBodies = await this.fetchOwnedPetBodies(userId);

        // Set the ownership flags based on the fetched data
        this.isDuzzyOwned = ownedPetBodies.includes('Duzzy');
        this.isBigYakOwned = ownedPetBodies.includes('BigYak');
        this.isCurlyOwned = ownedPetBodies.includes('Curly');
        this.isSpikeyOwned = ownedPetBodies.includes('Spikey');
        

      } else {
        console.log('User document does not exist.');
        // Handle the case when the user document does not exist
      }
    } catch (error) {
      console.error('Error fetching total points:', error);
      console.error('Error fetching current user:', error);
    }
  }
  
  async getDownloadUrl(part: string, imageName: string): Promise<string> {
    const imagePath = `PetDefault/${part}/${imageName}`;
    const storageRef = this.storage.ref(imagePath);
    return storageRef.getDownloadURL().toPromise();
  }


  // Method to save data to Firestore
  async save() {
    try {
      const currentUser = await this.authService.getCurrentUser();
      const userId = currentUser.uid;

      // Update or add data to the document
      await this.firestore.collection('users').doc(userId).update({
        petEyesUrl: this.petEyesUrl,
        petMouthUrl: this.petMouthUrl,
        petBodyUrl: this.petBodyUrl,
        // Add other properties as needed
      });

       // Log the name and URL of the selected pet body when saved
      console.log('Data saved successfully!', this.petBodyUrl);

      // Log the name and URL of the selected pet body when saved
      console.log(`Saved Pet Body: ${this.getSelectedPetBodyName()}, URL: ${this.petBodyUrl}`);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }


  getSelectedPetBodyName(): string {
    // Assuming the pet body URL is in the format 'PetDefault/Body/{PetBodyName}.png'
    const petBodyUrlParts = this.petBodyUrl.split('/');
    
    // Extract the pet body name from the URL
    const petBodyName = petBodyUrlParts[petBodyUrlParts.length - 1].replace('.png', '');
  
    return petBodyName;
  }

  
  async equipPetBody(petBodyUrl: string, petName: string) {
    // Update the selected pet body URL in the service
    this.petBodyService.setSelectedPetBodyUrl(petBodyUrl);

    // Update the pet body in the container
    this.petBodyUrl = petBodyUrl;

    // Log the name and URL of the selected pet body
    console.log(`Selected Pet Body: ${petName}, URL: ${petBodyUrl}`);
  }


  //buy body
  async buyPetBody(petName: string, price: number) {
    // Check if the user has enough points to buy the pet body
    if (this.totalPoints >= price) {
      // Deduct the price from the user's total points
      this.totalPoints -= price;

      // Update the ownership status
      switch (petName) {
        case 'Duzzy':
          this.isDuzzyOwned = true;
          break;
        case 'BigYak':
          this.isBigYakOwned = true;
          break;
        case 'Curly':
          this.isCurlyOwned = true;
          break;
        case 'Spikey':
          this.isSpikeyOwned = true;
          break;
        // Add similar cases for other pet bodies if needed
      }

      // Save the updated total points and owned pet bodies to Firestore or another source
      await this.updateUserData();

      // Notify the user that the purchase was successful
      console.log(`Successfully purchased ${petName} for ${price} Points.`);
    } else {
      // Notify the user that they don't have enough points
      console.log(`Not enough Points to buy ${petName}.`);
    }
  }

  async updateUserData() {
    try {
      const currentUser = await this.afAuth.currentUser;
      if (currentUser) {
        const userId = currentUser.uid;
        await this.firestore.collection('users').doc(userId).set({
          totalPoints: this.totalPoints,
          ownedPetBodies: this.getOwnedPetBodies(),
        }, { merge: true });
        console.log('User data updated successfully.');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }

  async fetchOwnedPetBodies(userId: string): Promise<string[]> {
    try {
      const userDoc = await this.firestore.collection('users').doc(userId).get().toPromise();
      return userDoc.get('ownedPetBodies') || [];
    } catch (error) {
      console.error('Error fetching owned pet bodies:', error);
      return [];
    }
  }

    // Helper method to get the list of owned pet bodies based on the ownership flags
    private getOwnedPetBodies(): string[] {
      const ownedPetBodies: string[] = [];
      if (this.isDuzzyOwned) {
        ownedPetBodies.push('Duzzy');
      }

      if (this.isBigYakOwned) {
        ownedPetBodies.push('BigYak');
      }

      if (this.isBigYakOwned) {
        ownedPetBodies.push('Curly');
      }

      if (this.isSpikeyOwned) {
        ownedPetBodies.push('Curly');
      }
      // Add similar conditions for other pet bodies if needed
      return ownedPetBodies;
    }

    

}
