import { Component, OnInit, Input } from '@angular/core';
import { ApiClientService } from '../service/api-client.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})

export class ConfigComponent implements OnInit {
    @Input() url: string;
    @Input() element: string;

    constructor(private api: ApiClientService) {
    }

    ngOnInit() {
    }

    public configure(): void {
      this.api.configure(this.url, this.element);
    }
}
