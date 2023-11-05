import { Injectable } from '@angular/core';
// import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';




@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    public ngFireAuth: AngularFireAuth,
    private firestore: AngularFirestore
    ) { }

  async registerUser(email: string, password:string, fullname:string){
    // return await this.ngFireAuth.createUserWithEmailAndPassword(email, password)
    try{
      const userCredential = await this.ngFireAuth.createUserWithEmailAndPassword(email, password)
      const user = userCredential.user;

      const userData = {
        email: user.email,
        fullname: fullname
      }

      await this.addUserDataToFirestore(user.uid, userData);

      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
      }
  }

  //Add data to the firestore
  private async addUserDataToFirestore(userId: string, userData: any) {
    try {
      const userRef = this.firestore.collection('users').doc(userId);
      await userRef.set(userData);
    } catch (error) {
      console.error('Error adding user data to Firestore:', error);
      throw error;
    }
  }

  async loginUser(email: string, password: string) {
    return await this.ngFireAuth.signInWithEmailAndPassword(email,password)
  }

  async resetPassword(email:string){
    return await this.ngFireAuth.sendPasswordResetEmail(email)
  }

  async signOut(){
    return await this.ngFireAuth.signOut()
  }

  async getProfile(){
    return await this.ngFireAuth.currentUser
  }

  //fetching the fullname and display
  async getUserDataByUid(uid: string) {
    try {
      const userDoc = await this.firestore.collection('users').doc(uid).get().toPromise();
      if (userDoc.exists) {
        return userDoc.data()
      } else{
        throw new Error('User data not found.')
      }
    }catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    } 
  }
}
