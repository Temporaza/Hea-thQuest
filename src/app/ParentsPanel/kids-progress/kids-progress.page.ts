import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, combineLatest } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map, switchMap } from 'rxjs/operators';
import { LoadingController, AlertController } from '@ionic/angular';
import { TaskStatusService } from 'src/app/services/task-status.service';

@Component({
  selector: 'app-kids-progress',
  templateUrl: './kids-progress.page.html',
  styleUrls: ['./kids-progress.page.scss'],
})
export class KidsProgressPage implements OnInit {

  tasks$: Observable<any>;
  isLoading = false;
  parentUID: string;

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private taskStatusService: TaskStatusService
  ) { }

  ngOnInit() {
    this.loadTasks();
  }

  async loadTasks() {
    const loading = await this.loadingController.create({
      message: 'Loading Tasks...',
      duration: 5000,
    });

    try {
      await loading.present();

      this.tasks$ = this.afAuth.authState.pipe(
        switchMap((user) => {
          if (user) {
            return this.firestore
              .collection('parents')
              .doc(user.uid)
              .collection('tasks', (ref) =>
                ref.where('status', '==', 'Waiting')
              )
              .snapshotChanges()
              .pipe(
                map((actions) => {
                  return actions.map((a) => {
                    const data = a.payload.doc.data() as any;
                    const id = a.payload.doc.id;
                    return { id, ...data };
                  });
                }),
                switchMap((taskObservables) =>
                combineLatest(
                  taskObservables.map((task) =>
                    this.firestore
                      .collection('parents')
                      .doc(task.parentId)
                      .collection('tasks')
                      .doc(task.id)
                      .valueChanges()
                      .pipe(
                        map((parentTask: any) => {
                          return { ...task, points: parentTask.points };
                        })
                      )
                  )
                )
              )
            );
          } else {
            return [];
          }
        })
      );
      await loading.dismiss();
    } catch (error) {
      console.error('Error loading tasks:', error);
      await loading.dismiss();
    }
  }

  async confirmTaskCompletion(task: any) {
    let loading: HTMLIonLoadingElement; // Declare the loading variable
    console.log(`Confirming task completion. Task: ${JSON.stringify(task)}`);
    
    try {
      loading = await this.loadingController.create({
        message: 'Confirming task completion...',
      });
  
      await loading.present();
  
      // Implement the logic for confirming a task completion
      task.status = 'Completed';
      console.log(`Task status set to 'Completed'. Updating Firestore...`);
  
      // Update the status in Firestore for 'parents' collection
      await this.firestore.collection('parents').doc(task.parentId)
        .collection('tasks').doc(task.id).update({ status: task.status });
  
      // Update the status in Firestore for 'users' collection
      await this.firestore.collection('users').doc(task.userId)
        .collection('tasks').doc(task.id).update({ status: task.status });
  
      // Fetch the points for the task
      this.firestore.collection('users').doc(task.userId)
        .collection('tasks').doc(task.id).get().subscribe((doc) => {
          const taskData = doc.data();
          const taskPoints = taskData ? taskData['points'] : 0;
          
          console.log(`Task points: ${taskPoints}`);
          // Notify the task service about the status change
          this.taskStatusService.setTaskStatus(task.status, taskPoints, task.userId);
        });

        // Fetch the current total points from Firestore
        const currentTotalPoints = await this.taskStatusService.getTotalPointsFromFirestore(task.userId);
        console.log(`Current total points at Firestore: ${currentTotalPoints}`);
        
    } catch (error) {
      console.error('Error confirming task completion:', error);
    } finally {
      // Dismiss the loading indicator
      if (loading) {
        await loading.dismiss();
      }
    }
  }
  

  async deleteTask(task: any) {
    // Implement the logic for deleting a task
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this task?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            // Delete the task from Firestore
            await this.firestore.collection('parents').doc(this.parentUID)
              .collection('tasks').doc(task.id).delete();
          },
        },
      ],
    });

    await alert.present();
  }

}
