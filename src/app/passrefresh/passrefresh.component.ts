import {Component, OnInit} from "@angular/core";
import {AuthService} from "../service/auth.service";

@Component({
  selector: 'passrefresh',
  templateUrl: './passrefresh.component.html',
  styleUrls: ['./passrefresh.component.css']
})

export class PassrefreshComponent implements OnInit{

  constructor(private auth: AuthService) {
  }

  ngOnInit(): void {
    if (this.auth.isNotFreshPass()) {
      this.blink();
    }
  }

  private blink() {
    let i = 0;
    let timer = setInterval(() => {
      i++;
      if (i % 2 === 0) {
        jQuery('#navbarSettings').css('color', 'white');

      } else {
        jQuery('#navbarSettings').css('color', 'red');
      }
    }, 500);
    setTimeout((): void => {
      clearInterval(timer);
      jQuery('#navbarSettings').css('color', 'grey');
    }, 5000);
  }
}
