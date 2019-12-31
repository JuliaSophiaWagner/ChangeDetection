import { Component, OnInit, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../service/api-client.service';
import { element } from 'protractor';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  constructor(private api: ApiClientService) {
    this.difference = '';
    this.api.contentChanged.subscribe( value => {
      if (value === true) {
        alert('The content of the watched website changed, go to the view.');

        this.oldImagePath = ' ';
        this.oldImagePath = './oldContent.png?t=' + (+new Date());
        this.newImagePath = ' ';
        this.newImagePath = './newContent.png?t=' + (+new Date());
        this.difference = this.getDifference();
        // this.highlight('newContent', this.api.messages.newContent);
        // this.highlight('oldContent', this.api.messages.oldContent);
        this.newContent = this.api.messages.newContent;
        this.oldContent = this.api.messages.oldContent;
      }
    });
}

  public oldImagePath = './oldContent.png?t=' + (+new Date());
  public newImagePath = './newContent.png?t=' + (+new Date());
  public oldContent: string;
  public newContent: string;
  public difference: string;

  ngOnInit() {
  }

  private highlight(elementID: string, text: string) {
    const inputText = document.getElementById(elementID);
    let innerHTML: string = text;
    const index = innerHTML.indexOf(this.difference);
    if (index >= 0) {
     innerHTML = '<pre><code>' + innerHTML.substring(0, index) + '<span class=\'highlight\' style="color:red">' +
     innerHTML.substring(index, index + this.difference.length) + '</span>' + innerHTML.substring(index + this.difference.length);
     inputText.innerHTML = innerHTML.toString() + '</code></pre>';
    }
  }

  private getDifference() {
      const firstString = this.api.messages.newContent;
      const secondString = this.api.messages.oldContent;
      const firstOccurrence = secondString.indexOf(firstString);
      let newString;

      if (firstOccurrence !== -1) {
        const stringALength = firstString.length;
        if (firstOccurrence === 0) {
            newString = secondString.substring(stringALength);
        } else {
            newString = secondString.substring(0, firstOccurrence);
            newString += secondString.substring(firstOccurrence + stringALength);
        }
      }

      return newString;
  }
}
