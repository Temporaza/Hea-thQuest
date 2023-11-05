import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/authentication.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';

 
  
  constructor(
    public formBuilder: FormBuilder, 
    public loadingCtrl: LoadingController, 
    public authService: AuthenticationService,
    public router: Router,
  
  ) { }

  clearErrorMessage(){
    this.errorMessage= '';
  }

  showErrorMessage(){
    this.errorMessage = 'Invalid Email or Password';
    setTimeout (() =>{
      this.clearErrorMessage();
    }, 2000);
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
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
    return this.loginForm?.controls;
  }

  async signUp(){
    const loading = await this.loadingCtrl.create();
    await loading.present();
    if(this.loginForm?.valid){
      if(this.loginForm?.valid){
        const user = await this.authService.loginUser(this.loginForm.value.email, this.loginForm.value.password).catch((error)=>{
          console.log(error);
          loading.dismiss()
          this.showErrorMessage();
        });

        if(user){
          loading.dismiss()
          this.clearFormFields();
          this.router.navigate(['/home'])
  
        }else{
          console.log('provide correct values');
        }
        
      }
    }
  }
  clearFormFields(){
    this.loginForm.reset();
  }


}
