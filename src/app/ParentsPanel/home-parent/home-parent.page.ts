import { Location } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  ToastController,
} from '@ionic/angular'; // Import NavController
import { AuthenticationForParentsService } from 'src/app/authenticationParents/authentication-for-parents.service';
import { BmiDiffPage } from 'src/app/modals/bmi-diff/bmi-diff.page';
import { OpenTaskDoneModalPage } from 'src/app/modals/open-task-done-modal/open-task-done-modal.page';
import { ParentsProfilePagePage } from 'src/app/modals/parents-profile-page/parents-profile-page.page';

interface BMIRecord {
  date: string;
  bmi: number;
}

interface ParentData {
  users?: string[];
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
  tasks?: any[];
  bmiHistory?: BMIRecord[];
  // Add other properties as needed
}

@Component({
  selector: 'app-home-parent',
  templateUrl: './home-parent.page.html',
  styleUrls: ['./home-parent.page.scss'],
})
export class HomeParentPage implements OnInit {
  parentFullName: string = '';
  profileImageUrl: string | null = null;
  checkedVaccines: number[] = []; // Add this line to declare the property
  appointments: any[] = [];

  usersData: UserData[] = [];

  currentUser: any;

  constructor(
    private authFire: AngularFireAuth,
    private navCtrl: NavController,
    private router: Router,
    private firestore: AngularFirestore,
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthenticationForParentsService,
    private loadingController: LoadingController,
    private location: Location
  ) {}

  // private listenToBackButton() {
  //   window.addEventListener('popstate', () => {
  //     // Reload the current page when the back button is clicked
  //     window.location.reload();
  //   });
  // }

  async ngOnInit() {
    // this.listenToBackButton();
    await this.presentLoading();
    await this.loadData();
    await this.dismissLoading();
    this.fetchParentName();

    this.authFire.authState.subscribe((user) => {
      if (user) {
        console.log('Authenticated user:', user);
        const userId = user.uid;
        const parentDocRef = this.firestore.collection('parents').doc(userId);
        parentDocRef.valueChanges().subscribe((data: any) => {
          if (data) {
            this.checkedVaccines = data.checkedVaccines || [];
            console.log('checkedVaccines:', this.checkedVaccines);
            this.profileImageUrl = data.profile || null;
          }
        });

        this.fetchParentName();
      } else {
        console.log('User not authenticated.');
        this.router.navigate(['/parent-login']);
      }
    });
    this.location.replaceState('/home-parent');
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Loading...',
    });
    await loading.present();
  }

  async dismissLoading() {
    const loading = await this.loadingController.getTop();
    if (loading) {
      await loading.dismiss();
    }
  }

  async loadData() {
    const loading = await this.loadingController.create({
      message: 'Loading...',
    });

    try {
      await loading.present();

      const user = await this.authService.getProfile();
      if (user) {
        const userId = user.uid;

        const parentDoc = await this.firestore
          .collection('parents')
          .doc(userId)
          .get()
          .toPromise();

        if (parentDoc.exists) {
          const parentData = parentDoc.data() as ParentData;
          const usersUIDs: string[] = parentData?.users || [];

          // Clear the existing data to avoid duplication
          this.usersData = [];

          // Fetch user information for each usersUID from the 'users' subcollection
          const usersInfoPromises = usersUIDs.map(async (userUID) => {
            const userDoc = await this.firestore
              .collection('parents')
              .doc(userId)
              .collection('users')
              .doc<UserData>(userUID)
              .get()
              .toPromise();

            if (userDoc.exists) {
              const userData = userDoc.data();
              // Make sure to include the usersUID property
              const userWithUID: UserData = {
                fullname: userData?.fullname || 'N/A',
                email: userData?.email || 'N/A',
                age: userData?.age,
                height: userData?.height,
                weight: userData?.weight,
                bmi: userData?.bmi,
                status: userData?.status,
                usersUID: userUID, // Include the usersUID property
                bmiHistory: userData?.bmiHistory || [],
                // Add other properties as needed
              };
              this.usersData.push(userWithUID);
            }
          });

          // Wait for all promises to complete
          await Promise.all(usersInfoPromises);
        }
      }
    } catch (error) {
      console.error('Error fetching parent document:', error);
    } finally {
      await loading.dismiss(); // Dismiss the loading indicator regardless of success or error
    }
  }

  private fetchParentName() {
    this.authFire.authState.subscribe(async (user) => {
      if (user) {
        // Get the reference to the document
        const parentDocRef = this.firestore.collection('parents').doc(user.uid);

        // Use snapshotChanges() to get the observable and subscribe to it
        parentDocRef.snapshotChanges().subscribe((parentSnapshot) => {
          const parentData = parentSnapshot.payload.data() as any; // Use payload property
          this.parentFullName = parentData?.fullname || ''; // Use the fullname property
        });
      }
    });
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

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to log out?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Logout',
          handler: () => {
            this.authFire
              .signOut()
              .then(() => {
                this.navCtrl.navigateRoot('/landing');
              })
              .catch((error) => {
                console.error('Error logging out:', error);
                // Handle any logout error, if needed
              });
          },
        },
      ],
    });

    await alert.present();
  }

  async openTaskDoneModal(userData: UserData) {
    console.log('User Data Tasks:', userData.tasks);
    const confirmedTasks = this.getConfirmedTasks(userData.tasks ?? []);
    console.log('Confirmed Tasks:', confirmedTasks);

    const modal = await this.modalController.create({
      component: OpenTaskDoneModalPage,
      componentProps: {
        userData: userData,
        confirmedTasks: confirmedTasks,
        usersUID: userData.usersUID,
      },
    });
    return await modal.present();
  }

  getConfirmedTasks(tasks: any[]): any[] {
    return tasks.filter(
      (task) => task.status === 'Completed' && task.confirmed
    );
  }

  async openBmiDiffModal() {
    const modal = await this.modalController.create({
      component: BmiDiffPage, // Update to your actual BMI Difference Modal
      componentProps: {
        userData: this.usersData, // Pass necessary data to the modal
      },
    });

    await modal.present();
  }

  navigateToEBook() {
    this.router.navigate(['/babybook']);
  }

  async openParentProfileModal() {
    const modal = await this.modalController.create({
      component: ParentsProfilePagePage,
      componentProps: {
        currentUser: this.currentUser || {}, // Pass an empty object if currentUser is undefined
      },
    });
    return await modal.present();
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.location.forward();
  }
}
