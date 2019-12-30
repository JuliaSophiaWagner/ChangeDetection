import { Component, OnInit, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../service/api-client.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  constructor(private api: ApiClientService) {
    this.api.contentChanged.subscribe( value => {
      if (value === true) {
        // alert('VIEW YEIY.');
        // const temp = this.oldImagePath;
        // this.setLinkPicture('');
        // this.setLinkPicture(temp);
        this.oldImagePath = './new.png';
        this.oldImagePath = './oldContent.png';
      }
    });
}


  @Output() oldImagePath = './oldContent.png';

  @Output() newImagePath = './newContent.png';

  ngOnInit() {
  }

  //   public getLinkPicture() {
  //     if (this.api.changed) {
  //         return this.oldImagePath + '?' + this.api.changed;
  //     }

  //     return this.oldImagePath;
  // }
  // public setLinkPicture(url: string) {
  //   this.oldImagePath = url;
  // }
}
