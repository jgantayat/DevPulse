import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardData } from '../../../core/models/todo';
import { Dashboard } from '../../../core/services/dashboard';
import { AsyncPipe } from '@angular/common';
@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {

  private dashboardService = inject(Dashboard);

  dashboardData : Observable<DashboardData> = this.dashboardService.getdashBoardData();

}
