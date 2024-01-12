import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-addusermodal',
  templateUrl: './addusermodal.page.html',
  styleUrls: ['./addusermodal.page.scss'],
})
export class AddusermodalPage implements OnInit {
  parentUid: string;
  parentEmail: string;

  babyData: any = {}; // Initialize babyData as an empty object
  babies: any[] = [];

  constructor(
    private modalController: ModalController,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
    
    ) { }

    ngOnInit() {
      this.babies = [];

      this.afAuth.authState.subscribe(user => {
        if (user) {
          this.parentUid = user.uid;
          this.parentEmail = user.email;
  
          // Load existing babies array
          this.loadBabies();
        }
      });
    }
  

  async dismissModal() {
    await this.modalController.dismiss();
  }

  loadBabies() {
    this.firestore
      .collection('parents')
      .doc(this.parentUid)
      .snapshotChanges()
      .subscribe((doc: any) => {
        const babiesObject = doc.payload.data()?.babies;
  
        // Convert the babies object into an array
        this.babies = babiesObject ? Object.values(babiesObject) : [];
      });
  }

  async saveBabyData() {
    try {
      if (!this.babyData.name || !this.babyData.age || !this.babyData.weight || !this.babyData.height) {
        throw new Error('Please fill in all required fields.');
      }
  
      // Perform any other validations if needed
  
      // Include vaccine details in the baby data
      this.babyData.vaccines = {
        vaccine1: false,  // You can set the default values as needed
        vaccine2: false,
        vaccine3: false,
        vaccine4: false,
      };
  
      // Save the new baby data into Firestore
      await this.saveBabyToFirestore(this.babyData);
  
      // Optionally, close the modal after saving
      this.modalController.dismiss({
        saved: true,
        babyData: this.babyData,
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  private async saveBabyToFirestore(babyData: any) {
    try {
      const parentDoc = await this.firestore.collection('parents').doc(this.parentUid).get().toPromise();
  
      if (parentDoc.exists) {
        const babiesCollection = parentDoc.ref.collection('babies');
        await babiesCollection.doc(babyData.name).set(babyData);
      }
    } catch (error) {
      console.error('Error saving baby data to Firestore:', error);
    }
  }


}
