import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LoadingController,
  AlertController,
  NavController,
} from '@ionic/angular';
import { AuthenticationForParentsService } from 'src/app/authenticationParents/authentication-for-parents.service';

@Component({
  selector: 'app-parent-login',
  templateUrl: './parent-login.page.html',
  styleUrls: ['./parent-login.page.scss'],
})
export class ParentLoginPage implements OnInit {
  logForm: FormGroup;
  errorMessage: string = '';
  notAuthorizedMessage: string = '';

  constructor(
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public authService: AuthenticationForParentsService,
    public router: Router,
    public alertController: AlertController,
    public navCtrl: NavController
  ) {}

  ngOnInit() {
    this.logForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          // Validators.pattern("[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          // Validators.pattern("(?=.*\d)(?=.*[a-z])(?=.*[0-8])(?=.*[A-Z]).{8,}")
        ],
      ],
    });
  }

  clearErrorMessage() {
    this.errorMessage = '';
  }

  showErrorMessage() {
    this.errorMessage = 'Invalid Email or Password';
    setTimeout(() => {
      this.clearErrorMessage();
    }, 2000);
  }
  notAuthrorized() {
    this.notAuthorizedMessage = 'You are not authorized to access here!';
    setTimeout(() => {
      this.clearErrorMessage();
    }, 2000);
  }
  get errorControl() {
    return this.logForm?.controls;
  }
  async signUp() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    if (this.logForm?.valid) {
      try {
        const userCredential = await this.authService.loginParent(
          this.logForm.value.email,
          this.logForm.value.password
        );

        const user = userCredential.user;

        const role = await this.authService.checkUserRole(user.uid);

        if (role === 'parent') {
          loading.dismiss();
          this.clearFormFields();
          this.navCtrl.navigateRoot(['/home-parent'], { replaceUrl: true });
          loading.dismiss();
          this.notAuthorized();
        }
      } catch (error) {
        console.log(error);
        loading.dismiss();
        this.showErrorMessage();
      }
    } else {
      loading.dismiss();
      this.presentAlert('Please fill in all required fields.');
    }
  }

  notAuthorized() {
    this.notAuthorizedMessage = 'You are not authorized to access here!';
    setTimeout(() => {
      this.clearErrorMessage();
    }, 2000);
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  clearFormFields() {
    this.logForm.reset();
  }
}
