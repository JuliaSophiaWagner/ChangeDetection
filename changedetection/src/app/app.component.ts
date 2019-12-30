import { Component } from '@angular/core';
import { ApiClientService } from './service/api-client.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'changedetection';

  get hasChanged() {
    return this.apiClient.changed;
  }

  constructor(private apiClient: ApiClientService) {
  }
}
