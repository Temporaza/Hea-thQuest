import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthenticationForParentsService } from 'src/app/authenticationParents/authentication-for-parents.service';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { VaccineDetailsModalPage } from 'src/app/modals/vaccine-details-modal/vaccine-details-modal.page';
import { EditUserModalPage } from 'src/app/modals/edit-user-modal/edit-user-modal.page';
import { AddusermodalPage } from 'src/app/modals/addusermodal/addusermodal.page';
import { ModalCalendarPage } from 'src/app/modals/modal-calendar/modal-calendar.page';


interface ParentData {
  users?: string[];
  babies?: any[];
}

interface UserData {
  fullname?: string;
  email?: string;
  age?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  status?: string;
  usersUID?: string;
  // Add other properties as needed
}


@Component({
  selector: 'app-vaccination',
  templateUrl: './vaccination.page.html',
  styleUrls: ['./vaccination.page.scss'],
})
export class VaccinationPage implements OnInit {

  parentUid: string;
  usersData: UserData[] = [];
  babies: any[] = [];

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthenticationForParentsService,
    private router: Router,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) { }

  async ngOnInit() {
    await this.loadData();
    await this.loadBabies();
  }

    async loadData() {
    const loading = await this.loadingController.create({
      message: 'Loading...',
    });

    try {
      await loading.present();

      const user = await this.authService.getProfile();
      if (user) {
        this.parentUid = user.uid;

        const parentDoc = await this.firestore
          .collection('parents')
          .doc<ParentData>(this.parentUid)
          .get()
          .toPromise();

        if (parentDoc.exists) {
          this.babies = parentDoc.data()?.babies || [];

          const usersUIDs: string[] = parentDoc.data()?.users || [];
          this.usersData = [];

          const usersInfoPromises = usersUIDs.map(async (userUID) => {
            const userDoc = await this.firestore
              .collection('parents')
              .doc(this.parentUid)
              .collection('users')
              .doc<UserData>(userUID)
              .get()
              .toPromise();

            if (userDoc.exists) {
              const userData = userDoc.data();
              const userWithUID: UserData = {
                fullname: userData?.fullname || 'N/A',
                email: userData?.email || 'N/A',
                age: userData?.age,
                height: userData?.height,
                weight: userData?.weight,
                bmi: userData?.bmi,
                status: userData?.status,
                usersUID: userUID,
              };
              this.usersData.push(userWithUID);
            }
          });

          await Promise.all(usersInfoPromises);
        }
      }
    } catch (error) {
      console.error('Error fetching parent document:', error);
    } finally {
      await loading.dismiss();
    }
  }

  

  // async showVaccineDetailsModal(userData: UserData) {
  //   console.log('Full Name:', userData.fullname);
  
  //   try {
  //     // Get the UID of the currently logged-in parent
  //     const parentUID = await this.authService.getCurrentParentUID();
  
  //     // Check if parentUID is available
  //     if (!parentUID) {
  //       console.error('Parent UID not available.');
  //       return;
  //     }
  
  //     // Get the reference to the users collection under the currently logged-in parent
  //     const usersCollection = this.firestore
  //       .collection('parents')
  //       .doc(parentUID)
  //       .collection('users');
  
  //     // Query Firestore to get the usersUID based on fullname
  //     const querySnapshot = await usersCollection.ref
  //       .where('fullname', '==', userData.fullname)
  //       .get();
  
  //     if (!querySnapshot.empty) {
  //       // Assuming there's only one match, use the first document
  //       const userDoc = querySnapshot.docs[0];
  //       const usersUID = userDoc.id;
  //       console.log('UsersUID:', usersUID);
  
  //       // Now you can pass usersUID to the modal
  //       const modal = await this.modalController.create({
  //         component: VaccineDetailsModalPage,
  //         componentProps: {
  //           userData: { ...userData, usersUID },
  //         },
  //       });
  
  //       await modal.present();
  //     } else {
  //       console.error('No matching user found for fullname:', userData.fullname);
  //     }
  //   } catch (error) {
  //     console.error('Error querying Firestore:', error);
  //   }
  // }

  async openCalendarModal() {
    const modal = await this.modalController.create({
      component: ModalCalendarPage,
    });

    await modal.present();
  }
  

  navigateToSignup() {
    this.router.navigate(['/signup']); 
  }

  async editUser(userData: any) {
    try {
      // Get the UID of the currently logged-in parent
      const parentUID = await this.authService.getCurrentParentUID();
  
      // Check if parentUID is available
      if (!parentUID) {
        console.error('Parent UID not available.');
        return;
      }
  
      // Log the parent UID
      console.log('Parent UID:', parentUID);
  
      // Find the user in usersData array based on fullname
      const userToEdit = this.usersData.find(user => user.fullname === userData.fullname);
  
      // Check if userToEdit is found
      if (userToEdit) {
        // Log the user UID
        console.log('User UID:', userToEdit.usersUID);
  
        const modal = await this.modalController.create({
          component: EditUserModalPage,
          componentProps: {
            userData: { ...userData},
          },
        });
  
        await modal.present();
      } else {
        console.error('User not found in usersData array for fullname:', userData.fullname);
      }
    } catch (error) {
      console.error('Error getting parent UID:', error);
    }
  }
  
  async openAddUserModal() {
    const modal = await this.modalController.create({
      component: AddusermodalPage, // Create a separate component for your modal
      componentProps: {
        // You can pass data if needed
      }
    });
  
    await modal.present();
  
    // Handle modal dismissal
    const { data } = await modal.onDidDismiss();
    if (data) {
      // Handle the data returned from the modal (if any)
      console.log('Modal closed with data:', data);
    }
  }

  async dismissModal() {
    await this.modalController.dismiss();
  }

  async loadBabies() {
    try {
      const parentDoc = await this.firestore.collection('parents').doc(this.parentUid).get().toPromise();
  
      if (parentDoc.exists) {
        const babiesCollection = parentDoc.ref.collection('babies');
        const babiesSnapshot = await babiesCollection.get();
  
        this.babies = babiesSnapshot.docs.map(doc => doc.data());
      }
    } catch (error) {
      console.error('Error loading babies:', error);
    }
}
  async openVaccineModal(baby: any) {
    const modal = await this.modalController.create({
      component: VaccineDetailsModalPage,
      componentProps: {
        baby: baby,
      },
    });
  
    await modal.present();
  }

}
