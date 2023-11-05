import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthenticationForParentsService } from 'src/app/authenticationParents/authentication-for-parents.service';


@Component({
  selector: 'app-parent-register',
  templateUrl: './parent-register.page.html',
  styleUrls: ['./parent-register.page.scss'],
})
export class ParentRegisterPage implements OnInit {

  regisForm : FormGroup;

  constructor(
    public formBuilder: FormBuilder, 
    public loadingCtrl: LoadingController, 
    public authService: AuthenticationForParentsService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.regisForm = this.formBuilder.group({
      fullname: ['', [Validators.required]],
      gender: ['', [Validators.required]],
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
    return this.regisForm?.controls;
  }

  async signUp(){
    const loading = await this.loadingCtrl.create();
    await loading.present();

    if(this.regisForm?.valid){
      const user = await this.authService.registerParent(
        this.regisForm.value.email, 
        this.regisForm.value.password,
        this.regisForm.value.gender,
        this.regisForm.value.fullname

        ).catch((error)=>{
        console.log(error);
        loading.dismiss()
      })
   
      if(user){
        loading.dismiss();
        this.clearFormFields();
        this.router.navigate(['/home-parent']);

      }else{
        console.log('provide correct values');
      }  
    }
  }
  clearFormFields(){
    this.regisForm.reset();
  }

}
