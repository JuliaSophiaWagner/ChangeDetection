import { Component, OnInit, Input } from '@angular/core';
import { ApiClientService } from '../service/api-client.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})

export class ConfigComponent implements OnInit {
    @Input() url: string;
    @Input() element: string;

    // get element() { return this.elementTemp; }
    // set element(v) {
    //   this.elementTemp = v;
    // }

    constructor(private api: ApiClientService) {
  }

    ngOnInit() {

    }

    public configure(): void {
      this.api.contentChanged.subscribe( value => {
        if (value === true) {
        }
      });

      console.log(this.url + ' ' + this.element);
      this.api.configure(this.url, this.element);
    }
}
