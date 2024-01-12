import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { LoadingController, AlertController } from '@ionic/angular';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TaskStatusService } from 'src/app/services/task-status.service';


@Component({
  selector: 'app-activities',
  templateUrl: './activities.page.html',
  styleUrls: ['./activities.page.scss'],
})
export class ActivitiesPage implements OnInit {

  userTasks$: Observable<any>;
  isLoading = false;
  taskStatus: string;
  taskStatus$: Observable<string>;

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private taskStatusService: TaskStatusService
  ) { }

  ngOnInit() {
    this.taskStatusService.getTaskStatus().subscribe((statusWithPoints) => {
      const { status, points } = statusWithPoints;
  
      // Now you can use both status and points
      this.taskStatus = status;
      // You might also want to use points here if needed
  
      // Continue with the rest of your code...
      this.loadUserTasks();
    });
  }

  async loadUserTasks() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Loading tasks...',
      duration: 5000,
    });

    await loading.present();

    this.userTasks$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          const userId = user.uid;
          return this.firestore
            .collection('users')
            .doc(userId)
            .collection('tasks')
            .snapshotChanges()
            .pipe(
              map((actions) => {
                return actions.map((a) => {
                  const data = a.payload.doc.data() as any;
                  const id = a.payload.doc.id;
                   // Ensure 'completed' property is defined in each task
                  const task = { id, ...data, completed: false };
              
                  // Assuming you have a 'points' field in the task documen
                  return this.firestore
                    .collection('parents')
                    .doc(task.parentId)
                    .collection('tasks')
                    .doc(id)
                    .valueChanges()
                    .pipe(
                      map((parentTask: any) => {
                        return { ...task, points: parentTask ? parentTask.points : 0 };
                      })
                    );
                });
              }),
              switchMap((taskObservables) => combineLatest(taskObservables))
            );
        } else {
          return [];
        }
      })
    );

    this.isLoading = false;
    await loading.dismiss();
  }

  async updateTaskStatus(task: any) {
    
    // Update the status to 'Waiting' directly
    task.status = 'Waiting';
  
    // Add the necessary logic to get userId and parentId
    let userId: string | null = null;
    const currentUser = await this.afAuth.currentUser;
  
    if (currentUser) {
      userId = currentUser.uid;
      const parentId = task.parentId;
  
      // Update the status in Firestore for both 'users' and 'parents' collections
      this.firestore
        .collection('users')
        .doc(userId)
        .collection('tasks')
        .doc(task.id)
        .update({ status: task.status });
  
      this.firestore
        .collection('parents')
        .doc(parentId)
        .collection('tasks')
        .doc(task.id)
        .update({ status: task.status });
  
      // Update the task status in the service without adding points
      this.taskStatusService.setTaskStatus(task.status, task.points, userId, false);
    }
  }

  async deleteTask(task: any) {
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
            // Delete the task from Firestore in the 'users' collection
            const currentUser = this.afAuth.currentUser;
            if (currentUser) {
              const userId = (await currentUser).uid;
              await this.firestore.collection('users').doc(userId).collection('tasks').doc(task.id).delete();
            }
  
            // Delete the task from Firestore in the 'parents' collection
            const parentId = task.parentId; // Make sure you have the parentId stored in the task
            if (parentId) {
              await this.firestore.collection('parents').doc(parentId).collection('tasks').doc(task.id).delete();
            }
          },
        },
      ],
    });
  
    await alert.present();
  }

}
