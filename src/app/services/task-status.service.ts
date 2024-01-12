import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class TaskStatusService {

  private taskStatusSubject = new BehaviorSubject<{ status: string, points: number }>({ status: '', points: 0 });
  private totalPointsSubject = new BehaviorSubject<number>(0)

  constructor(
    private firestore: AngularFirestore
  ) { }
  
  /**
   * Set the task status and update total points if confirmed.
   * @param status - The new status of the task.
   * @param points - The points associated with the task.
   * @param userId - The user ID associated with the task.
   * @param confirmed - Whether the task is confirmed or not.
   */

  getTaskStatus(): Observable<{ status: string, points: number }> {
    return this.taskStatusSubject.asObservable();
  }

  getTotalPoints(): Observable<number> {
    return this.totalPointsSubject.asObservable();
  }

  setTaskStatus(status: string, points: number, userId: string, confirmed: boolean = false) {
    // If confirmed, update total points
    if (confirmed) {
      const currentTotalPoints = this.totalPointsSubject.value;
      const newTotalPoints = currentTotalPoints + points;

      // Update the total points in Firestore
      this.updateTotalPointsInFirestore(userId, newTotalPoints);

      // Update the local total points subject
      this.totalPointsSubject.next(newTotalPoints);

      console.log(`Total points updated. User ID: ${userId}, Total Points: ${newTotalPoints}`);
    }

    // Update the task status subject
    this.taskStatusSubject.next({ status, points });
  }

  private async updateTotalPointsInFirestore(userId: string, points: number) {
    try {
      if (!userId) {
        console.error('Invalid user ID:', userId);
        return;
      }
  
      const userDoc = await this.firestore.collection('users').doc(userId).get().toPromise();
  
      if (userDoc.exists) {
        const currentTotalPoints = (userDoc.data() as { totalPoints?: number })?.totalPoints || 0;
        const newTotalPoints = currentTotalPoints + points;
  
        // Update the total points in Firestore
        await this.firestore.collection('users').doc(userId).update({ totalPoints: newTotalPoints });
  
        // Update the local total points subject
        this.totalPointsSubject.next(newTotalPoints);
  
        console.log(`Total points updated in Firestore. User ID: ${userId}, Total Points: ${newTotalPoints}`);
      } else {
        console.error('User not found in Firestore:', userId);
      }
    } catch (error) {
      console.error('Error updating total points in Firestore:', error);
    }
  }
  
  

  setTotalPoints(totalPoints: number): void {
    this.totalPointsSubject.next(totalPoints);
  }

  getTotalPointsFromFirestore(userId: string): Promise<number> {
    return this.firestore.collection('users').doc(userId).get().toPromise().then((doc) => {
      return doc.exists ? (doc.data() as any)?.totalPoints || 0 : 0;
    });
  }
}
