import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationService } from 'src/app/authentication.service';
import { PetBodyServiceService } from 'src/app/services/pet-body.service.service';


@Component({
  selector: 'app-market',
  templateUrl: './market.page.html',
  styleUrls: ['./market.page.scss'],
})
export class MarketPage implements OnInit {

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

  constructor(
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private authService: AuthenticationService,
    private petBodyService: PetBodyServiceService
   
  ) { }

  async ngOnInit() {
    try {
      // Get the current user
      const currentUser = await this.authService.getCurrentUser();
  
      // Log the user's information
      console.log('Current User:', currentUser);
  
      // Fetch the user's document from Firestore
      const userId = currentUser.uid;
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
      } else {
        console.log('User document does not exist.');
        // Handle the case when the user document does not exist
      }
    } catch (error) {
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

}
