import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { AuthenticationForParentsService } from 'src/app/authenticationParents/authentication-for-parents.service';
import { DataPrivacyPage } from 'src/app/modals/data-privacy/data-privacy.page';

@Component({
  selector: 'app-parent-register',
  templateUrl: './parent-register.page.html',
  styleUrls: ['./parent-register.page.scss'],
})
export class ParentRegisterPage implements OnInit {
  regisForm: FormGroup;
  permission: boolean = false;

  constructor(
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public authService: AuthenticationForParentsService,
    public router: Router,
    public alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.regisForm = this.formBuilder.group({
      fullname: ['', Validators.required],
      sex: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      permission: [false, Validators.requiredTrue], // Add this line
    });
  }

  get errorControl() {
    return this.regisForm?.controls;
  }

  async openDataPrivacyModal() {
    const modal = await this.modalController.create({
      component: DataPrivacyPage,
      // You may need to pass any required data to the modal component here
    });
    return await modal.present();
  }

  async signUp() {
    if (!this.permission) {
      const alert = await this.alertController.create({
        header: 'Permission Required',
        message:
          'Please check the permission box to proceed with the sign-up process.',
        buttons: ['OK'],
      });
      await alert.present();
      return; // Exit the method if permission is not granted
    }

    const loading = await this.loadingCtrl.create();
    await loading.present();

    if (this.regisForm?.valid) {
      try {
        const user = await this.authService.registerParent(
          this.regisForm.value.email,
          this.regisForm.value.password,
          this.regisForm.value.sex,
          this.regisForm.value.fullname
        );

        if (user) {
          // Send email verification after successful registration
          await this.authService.sendEmailVerification();

          // Dismiss loading and navigate to email verification page
          loading.dismiss();
          this.router.navigate(['/email-verification-required']);
        } else {
          console.log('provide correct values');
          loading.dismiss();
        }
      } catch (error) {
        console.error('Error registering user:', error);
        loading.dismiss();
        this.presentAlert('Error registering user. Please try again.');
      }
    } else {
      loading.dismiss();
      this.presentAlert('Please fill in all required fields.');
    }
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
    this.regisForm.reset();
  }
}
