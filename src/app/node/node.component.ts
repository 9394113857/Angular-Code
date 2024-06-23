import { Component, OnInit, OnDestroy } from '@angular/core';
import { NodeService } from '../node.service';
import { interval, Subscription, throwError } from 'rxjs';
import { switchMap, catchError, delayWhen } from 'rxjs/operators';

interface Mobile {
  id?: number | null;
  name: string;
  price: number;
  ram: number;
  storage: number;
}

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.css']
})
export class NodeComponent implements OnInit, OnDestroy {

  formHeader: string = "Add Mobile";
  mobiles: Mobile[] = [];
  mobileName: string = "";
  price: number = 0;
  ram: number = 0;
  storage: number = 0;
  showForm: boolean = false;
  id: number | null = null;
  private refreshSubscription: Subscription | undefined;

  constructor(private mobileService: NodeService) {}

  ngOnInit(): void {
    this.getMobiles();
    this.setupDataRefresh();
  }

  private setupDataRefresh() {
    const refreshIntervalMs = 60000; // 60,000 milliseconds = 60 seconds = 1 minute
    let disconnected = false;

    this.refreshSubscription = interval(refreshIntervalMs)
      .pipe(
        switchMap(() => {
          if (disconnected) {
            return throwError('Disconnected from server');
          }
          return this.mobileService.fetchMobiles().pipe(
            catchError(() => {
              disconnected = true;
              return throwError('Disconnected from server');
            })
          );
        }),
        delayWhen(data => {
          if (disconnected) {
            return interval(refreshIntervalMs);
          }
          return interval(0);
        })
      )
      .subscribe(
        (data: Mobile[]) => {
          this.mobiles = data;
          disconnected = false;
        },
        (error: any) => {
          console.log('Error fetching mobiles:', error);
        }
      );
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  getMobiles() {
    this.mobileService.fetchMobiles().subscribe(
      (data: Mobile[]) => {
        this.mobiles = data;
      },
      (error: any) => {
        console.log("Error fetching mobiles:", error);
      }
    );
  }

  deleteMobile(id: number | null) {
    if (id !== null) {
      this.mobileService.deleteMobile(id).subscribe(
        (res: any) => {
          this.getMobiles();
        },
        (error: any) => {
          console.log("Error deleting mobile:", error);
        }
      );
    } else {
      console.log("Invalid ID provided for deletion");
    }
  }

  openForm(data: Mobile | null = null) {
    this.clearForm();
    this.showForm = true;
    if (data) {
      this.mobileName = data.name;
      this.price = data.price;
      this.ram = data.ram;
      this.storage = data.storage;
      this.id = data.id !== undefined ? data.id : null;
      this.formHeader = "Edit Mobile";
    } else {
      this.id = null;
      this.formHeader = "Add Mobile";
    }
  }

  closeForm() {
    this.showForm = false;
    this.clearForm();
  }

  clearForm() {
    this.mobileName = "";
    this.price = 0;
    this.ram = 0;
    this.storage = 0;
    this.id = null;
  }

  saveMobile() {
    this.showForm = false;
    let body: Mobile = {
      name: this.mobileName,
      price: this.price,
      ram: this.ram,
      storage: this.storage
    };

    if (this.id !== null) {
      body.id = this.id;
      this.mobileService.putMobile(this.id, body).subscribe(
        (res) => {
          this.getMobiles();
        },
        (error) => {
          console.log("Error updating mobile:", error);
        }
      );
    } else {
      this.mobileService.postMobile(body).subscribe(
        (res) => {
          this.getMobiles();
        },
        (error) => {
          console.log("Error adding mobile:", error);
        }
      );
    }
  }

  hasData(): boolean {
    return this.mobiles !== undefined && this.mobiles.length > 0;
  }

  hasError(): boolean {
    return this.mobiles.length === 0;
  }
}
