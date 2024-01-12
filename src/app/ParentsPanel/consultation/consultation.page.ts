import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Chart } from 'chart.js/auto';
import { Observable, map } from 'rxjs';

interface BMIRecord {
  date: string;
  bmi: number;
}

interface UserData {
  uid: string;
  fullname: string;
  bmi: number;
  bmiHistory?: BMIRecord[];
}

interface Task {
  id: string;
  description: string;
  // Add other task properties as needed
}

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.page.html',
  styleUrls: ['./consultation.page.scss'],
})
export class ConsultationPage implements OnInit, AfterViewInit {

  parentUID: string;
  usersData: any[] = []; // Array to store user data
  tasksDone$: Observable<Task[]>;

  @ViewChildren('lineCanvas') lineCanvases: QueryList<ElementRef>;
  @ViewChildren('pieCanvas', { read: ElementRef }) pieCanvases: QueryList<ElementRef>;

  constructor(
    private firestore: AngularFirestore,
    private authFire: AngularFireAuth,
  ) { }

  ngOnInit() {
    // Get the currently authenticated user
    this.authFire.authState.subscribe(user => {
      if (user) {
        // Set the parent UID to the user's UID
        this.parentUID = user.uid;

        // Call the function to fetch user data
        this.fetchUserData();

              // Call the function to create the line graph after the view has been initialized
         this.createLineGraphs();
      }
    });
  }

  ngAfterViewInit() {
    // Log to check if lineCanvases is populated
    console.log('Line Canvases:', this.lineCanvases);
    console.log('Pie Canvases:', this.pieCanvases);
  
    // Call the function to create the line graph after the view has been initialized
    this.createLineGraphs();
    this.createPieGraphs();
  
    // Subscribe to changes in lineCanvases
    this.lineCanvases.changes.subscribe(() => {
      console.log('Line Canvases (changes):', this.lineCanvases);
      this.createLineGraphs();
    });

    this.pieCanvases.changes.subscribe(() => {
      console.log('Pie Canvases (changes):', this.pieCanvases);
      this.createPieGraphs();
    });
  }

  createLineGraphs() {
    this.lineCanvases.forEach(canvasRef => {
      if (canvasRef && canvasRef.nativeElement) {
        try {
          const uid = canvasRef.nativeElement.id.split('_')[1];
          const userData = this.usersData.find(user => user.uid === uid);
  
          if (!userData) {
            console.error(`User data not found for UID: ${uid}`);
            return;
          }
  
          const bmiData = userData.bmiHistory?.map(entry => entry.bmi) || [];
          const dateLabels = userData.bmiHistory?.map(entry => entry.date) || [];
  
          const data = {
            labels: dateLabels,
            datasets: [
              {
                label: 'BMI Progress',
                data: bmiData,
                fill: true,
                backgroundColor: 'rgba(75,192,192,0.2)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: 'rgba(75,192,192,1)',
              }
            ]
          };
  
          const options: any = {
            scales: {
              x: {
                type: 'category',
                title: {
                  display: true,
                  text: 'Dates'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'BMI Value'
                }
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
              }
            },
            backgroundColor: 'black',
          };
  
          const ctx = canvasRef.nativeElement.getContext('2d');
  
          // Destroy existing Chart instance
          Chart.getChart(ctx)?.destroy();
  
          const lineChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
          });
        } catch (error) {
          console.error(`Error creating graph: ${error.message}`);
        }
      }
    });
  }



 createPieGraphs() {
  this.pieCanvases.forEach(canvasRef => {
    if (canvasRef && canvasRef.nativeElement) {
      try {
        const uid = canvasRef.nativeElement.id.split('_')[1];

        // Fetch tasks for the specific user using the usersUID
        this.firestore.collection(`parents/${this.parentUID}/tasks`).snapshotChanges()
          .pipe(
            map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data() as any;
                const id = a.payload.doc.id;
                return { id, ...data };
              });
            })
          )
          .subscribe(tasks => {
            // Filter tasks based on userId matching userUID
            const filteredTasks = tasks.filter(task => task.userId === uid);

            // Create a map to store task counts
            const taskCounts = new Map<string, number>();

            // Count occurrences of each task
            filteredTasks.forEach(task => {
              const description = task.description;
              taskCounts.set(description, (taskCounts.get(description) || 0) + 1);
            });

            const totalCount = Array.from(taskCounts.values()).reduce((acc, count) => acc + count, 0);

            // Calculate the percentage for each task and limit to two decimal places
            const percentageData = Array.from(taskCounts.values()).map(count => parseFloat((count / totalCount * 100).toFixed(2)));

            const data = {
              labels: Array.from(taskCounts.keys()),
              datasets: [
                {
                  data: percentageData,
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                  ],
                },
              ],
            };

            const options: any = {
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  labels: {
                    generateLabels: function (chart: any) {
                      const data = chart.data;
                      if (data.labels.length && data.datasets.length) {
                        return data.labels.map(function (label: any, i: number) {
                          const count = taskCounts.get(label) || 0;
                          const percentage = data.datasets[0].data[i];

                          return {
                            text: `${label}: ${count} tasks (${percentage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)`,
                            fillStyle: data.datasets[0].backgroundColor[i],
                            hidden: isNaN(percentage) || data.datasets[0].data[i] === 0,
                          };
                        });
                      }
                      return [];
                    },
                  },
                },
              },
              backgroundColor: 'black',
            };

            const ctx = canvasRef.nativeElement.getContext('2d');

            // Destroy existing Chart instance
            Chart.getChart(ctx)?.destroy();

            const pieChart = new Chart(ctx, {
              type: 'pie',
              data: data,
              options: options,
            });
          });
      } catch (error) {
        console.error(`Error creating pie graph: ${error.message}`);
      }
    }
  });
}
  

  
  
  
  fetchUserData() {
    // Fetch user data from Firestore
    this.firestore
      .collection('parents')
      .doc(this.parentUID)
      .collection('users')
      .get()
      .subscribe(querySnapshot => {
        // Reset the usersData array
        this.usersData = [];

        // Iterate through the user documents
        querySnapshot.forEach(doc => {
          const userData: UserData = { uid: doc.id, ...doc.data() } as UserData;
          this.usersData.push(userData);
        });

        // Call the function to create the line graphs after fetching user data
        this.createLineGraphs();
      });
  }
}
