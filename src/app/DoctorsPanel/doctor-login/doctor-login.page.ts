import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthenticationForDoctorsService } from 'src/app/authenticationDoctors/authentication-for-doctors.service';

@Component({
  selector: 'app-doctor-login',
  templateUrl: './doctor-login.page.html',
  styleUrls: ['./doctor-login.page.scss'],
})
export class DoctorLoginPage implements OnInit {
  formLog: FormGroup;
  errorMessage: string = '';
  notAuthorizedMessage: string=''

  constructor(
    public formBuilder: FormBuilder, 
    public loadingCtrl: LoadingController, 
    public authService: AuthenticationForDoctorsService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.formLog = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern("[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"),

      ]],
      password: ['',[
      Validators.required,
      Validators.pattern("(?=.*\d)(?=.*[a-z])(?=.*[0-8])(?=.*[A-Z]).{8,}")
      ]]
    })
    
  }
  clearErrorMessage(){
    this.errorMessage= '';
  }

  notAuthrorized(){
    this.notAuthorizedMessage = 'You are not authorized to login here!';
    setTimeout (() =>{
      this.clearErrorMessage();
    }, 2000);
  }

  showErrorMessage(){
    this.errorMessage = 'Invalid Email or Password';
    setTimeout (() =>{
      this.clearErrorMessage();
    }, 2000);
  }

  get errorControl(){
    return this.formLog?.controls;
  }
  async signUp() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
  
    if (this.formLog?.valid) {
      try {
        const userCredential = await this.authService.loginDoctor(
          this.formLog.value.email,
          this.formLog.value.password
        );
  
        const user = userCredential.user; // Access the user object
  
        // Determine the user's role
        const role = await this.authService.checkUserRole(user.uid);
  
        if (role === 'doctor') {
          loading.dismiss();
          this.clearFormFields();
          this.router.navigate(['/doctor-home']); // Redirect to the doctor home page
        } else {
          loading.dismiss();
          this.notAuthrorized();
        }
      } catch (error) {
        console.log(error);
        loading.dismiss();
        this.showErrorMessage();
      }
    }
  }

  clearFormFields(){
    this.formLog.reset();
  }

}
