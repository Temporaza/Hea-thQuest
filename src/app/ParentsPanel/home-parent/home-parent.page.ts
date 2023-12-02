import { Component, OnInit } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular'; // Import NavController
import { AuthenticationForParentsService } from 'src/app/authenticationParents/authentication-for-parents.service';
import { VaccineDetailsModalPage } from 'src/app/modals/vaccine-details-modal/vaccine-details-modal.page';


@Component({
  selector: 'app-home-parent',
  templateUrl: './home-parent.page.html',
  styleUrls: ['./home-parent.page.scss'],
})
export class HomeParentPage implements OnInit {

  parentFullName: string = '';
  checkedVaccines: number[] = []; // Add this line to declare the property

  constructor(
    
    private authService: AngularFireAuth,
    private navCtrl: NavController,
    private router: Router,
    private firestore: AngularFirestore,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    console.log('ngOnInit called');
    this.fetchParentName();
    // Retrieve the checked state from Firestore
    this.authService.authState.subscribe(user => {
      if (user) {
        console.log('Authenticated user:', user);
  
        const userId = user.uid;
  
        // Get the reference to the document
        const parentDocRef = this.firestore.collection('parents').doc(userId);
  
        // Use onSnapshot to listen for real-time changes
        parentDocRef.valueChanges().subscribe((data: { checkedVaccines: number[] }) => {
          if (data) {
            this.checkedVaccines = data.checkedVaccines || [];
            console.log('checkedVaccines:', this.checkedVaccines);
          }
        });
  
        this.fetchParentName();
      } else {
        console.log('User not authenticated.');
        this.router.navigate(['/login']);
      }
    });
  }

  private async fetchParentName() {
    try {
      const user = await this.authService.currentUser;
      if (user && user.uid) {
        // Use the user data directly if it contains the fullname
        this.parentFullName = user.displayName || '';
  
        // If you need to fetch additional data from Firestore, you can do so here
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  isActivityLocked(): boolean {
    // Check if all 8 checkboxes are checked
    // console.log('Number of checked vaccines:', this.checkedVaccines.length);
    return this.checkedVaccines.length !== 8;
  }

  navigateToActivity() {
    // Implement the navigation logic to the Activity page
    this.router.navigate(['/parents-activity']);
  }

  logout() {
    // Call your authentication service's signOut method to log the user out
    this.authService.signOut()
      .then(() => {
        // After logging out, navigate to the login page or any other desired page
        this.navCtrl.navigateRoot('/landing'); // Navigate to the login page
      })
      .catch((error) => {
        console.error('Error logging out:', error);
        // Handle any logout error, if needed
      });
  }
}
