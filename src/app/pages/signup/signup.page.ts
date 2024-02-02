import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/authentication.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  regForm : FormGroup;

  constructor(
    public formBuilder: FormBuilder, 
    public loadingCtrl: LoadingController, 
    public authService: AuthenticationService,
    public router: Router,
    private firestore: AngularFirestore,
    private alertController: AlertController,  // Add this line
  ) { }

 

  ngOnInit() {
    this.regForm = this.formBuilder.group({
      fullname: ['', [Validators.required]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern("[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"),

      ]],
      password: ['',[
      // Validators.required,
      // Validators.pattern("(?=.*\d)(?=.*[a-z])(?=.*[0-8])(?=.*[A-Z]).{8,}")
      ]],
      parentEmail: ['', [Validators.required, Validators.email]],
    })
  }
  get errorControl(){
    return this.regForm?.controls;
  }

  async signUp() {
  const loading = await this.loadingCtrl.create();
  await loading.present();

  if (this.regForm?.valid) {
    const parentEmail = this.regForm.value.parentEmail;

    // Check if the parent's email exists in the parents' collection
    const parentUID = await this.getParentUIDByEmail(parentEmail);

    if (!parentUID) {
      // Parent's email not found, display an error message
      loading.dismiss();
      console.log('Parent not found for email:', parentEmail);
      this.presentErrorAlert('Error', 'Parent Email does not exists.');
      // Add your logic to display an error message to the user, e.g., using a toast or an alert
      return;
    }

    const user = await this.authService.registerUser(
      this.regForm.value.email, 
      this.regForm.value.password,
      this.regForm.value.fullname,
      parentEmail
    ).catch((error) => {
      console.log(error);
      loading.dismiss();
    });

    if (user) {
      // Save the new user information to the parent's UID
      await this.saveUserToParent(parentUID, user);

      loading.dismiss();
      this.clearFormFields();
      this.router.navigate(['/home']);
    } else {
      console.log('Provide correct values');
    }
  }
}

async getParentUIDByEmail(parentEmail: string): Promise<string | null> {
  try {
    // Call the method from AuthenticationService or wherever it's defined
    const parentUID = await this.authService.getParentUIDByEmail(parentEmail);
    return parentUID;
  } catch (error) {
    // Show error pop-up
    this.presentErrorAlert('Error', 'An error occurred. Please try again.');
    return null;
  }
}

  // Helper method to present error alert
  async presentErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }


  // Method to save user information to parent's UID
  async saveUserToParent(parentUID: string, user: any) {
    try {
      // Create a reference to the user document in the 'users' collection
      const userDocRef = this.firestore.collection('users').doc(user.uid);
  
      // Get the user document data
      const userDataSnapshot = await userDocRef.get().toPromise();
  
      // Check if the user document exists
      if (userDataSnapshot.exists) {
        // Get the user data
        const userData = userDataSnapshot.data();
  
        // Create a reference to the 'users' subcollection under the parent
        const parentUserCollectionRef = this.firestore.collection(`parents/${parentUID}/users`);
  
        // Save the user data to the 'users' subcollection under the parent
        await parentUserCollectionRef.doc(user.uid).set(userData);
      } else {
        console.error('Error updating parent document: User document does not exist');
        // Handle the error appropriately
        throw new Error('User document does not exist');
      }
    } catch (error) {
      console.error('Error updating parent document:', error);
      throw error;
    }
  }
  
  
  

  clearFormFields(){
    this.regForm.reset();
  }
}
