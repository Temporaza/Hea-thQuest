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

    // Subscribe to changes in the selected pet body URL
    // Load saved pet body URL from local storage
  const savedPetBodyUrl = localStorage.getItem('selectedPetBodyUrl');

  // If a saved URL exists, use it; otherwise, fetch the default URL
  this.petBodyUrl = savedPetBodyUrl || 'default-pet-body-url';

    this.petEyesUrl = await this.getDownloadUrl('mata', 'One.png');
    this.petMouthUrl = await this.getDownloadUrl('Mouth', 'M5.png');
    // Fetch the initial pet body URL
    this.petBodyUrl = this.petBodyService.getSelectedPetBodyUrl() || 'default-pet-body-url';

    //pet-bodies
    this.duzzyUrl = await this.getDownloadUrl('Body', 'Duzzy.png');
    this.big_YakUrl = await this.getDownloadUrl('Body', 'Big Yak.png');
    this.curlyUrl = await this.getDownloadUrl('Body', 'Curly.png');
    this.spikeyUrl = await this.getDownloadUrl('Body', 'Spikey.png');
    this.sumoUrl = await this.getDownloadUrl('Body', 'Sumo.png');
    this.wet_dogUrl = await this.getDownloadUrl('Body', 'WetDog.png');
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

      console.log('Data saved successfully!', this.petBodyUrl);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  equipPetBody(petBodyUrl: string) {
    // Update the selected pet body URL in the service
    this.petBodyService.setSelectedPetBodyUrl(petBodyUrl);
  
    // Update the pet body in the container
    this.petBodyUrl = petBodyUrl;
  }

}
