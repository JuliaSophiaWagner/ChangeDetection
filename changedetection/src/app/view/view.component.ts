import { Component, OnInit, Output, Input } from '@angular/core';
import { ApiClientService } from '../service/api-client.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})

export class ViewComponent implements OnInit {

  constructor(private api: ApiClientService) {
    this.oldImagePath = './oldContent.png?t=' + (+new Date());
    this.newImagePath = './newContent.png?t=' + (+new Date());
    this.difference = '';

    this.api.contentChanged.subscribe( value => {
      if (value === true) {
        if (this.api.messages.alertMessage.length > 0) {
          alert(this.api.messages.alertMessage);
        } else if (this.api.contentChanged) {
            this.oldImagePath = ' ';
            this.oldImagePath = './oldContent.png?t=' + (+new Date());
            this.newImagePath = ' ';
            this.newImagePath = './newContent.png?t=' + (+new Date());
            this.newContent = this.api.messages.newContent;
            this.oldContent = this.api.messages.oldContent;
        }

        if (this.api.messages.changed) {
          alert('The content of the watched website changed, go to the view.');
        }
      }
    });
}

  public oldImagePath: string;
  public newImagePath: string;
  public oldContent: string;
  public newContent: string;
  public difference: string;

  ngOnInit() {
  }
}
