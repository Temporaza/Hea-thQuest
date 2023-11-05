import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthenticationForDoctorsService } from 'src/app/authenticationDoctors/authentication-for-doctors.service';

@Component({
  selector: 'app-doctor-register',
  templateUrl: './doctor-register.page.html',
  styleUrls: ['./doctor-register.page.scss'],
})
export class DoctorRegisterPage implements OnInit {

  formReg: FormGroup;
  
  constructor(
    public formBuilder: FormBuilder, 
    public loadingCtrl: LoadingController, 
    public authService: AuthenticationForDoctorsService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.formReg = this.formBuilder.group({
      fullname: ['', [Validators.required]],
      ClinicAddress: ['', [Validators.required]],
      contact: ['', [Validators.required]],
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
  get errorControl(){
    return this.formReg?.controls;
  }

  async signUp(){
    const loading = await this.loadingCtrl.create();
    await loading.present();

    if(this.formReg?.valid){
      const user = await this.authService.registerDoctor(
        this.formReg.value.email, 
        this.formReg.value.password,
        this.formReg.value.ClinicAddress,
        this.formReg.value.fullname,
        this.formReg.value.contact

        ).catch((error)=>{
        console.log(error);
        loading.dismiss()
      })
   
      if(user){
        loading.dismiss();
        this.clearFormFields();
        this.router.navigate(['/doctor-home']);

      }else{
        console.log('provide correct values');
      }  
    }
  }
  clearFormFields(){
    this.formReg.reset();
  }

}
