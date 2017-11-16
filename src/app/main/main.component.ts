import {Component, OnInit, ViewChild} from '@angular/core';
import {ModalDirective} from 'ngx-bootstrap';
import {AuthenticationService} from '../core/services/authentication/authentication.service';
import {NotificationService} from '../core/services/notification/notification.service';

declare const $: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  @ViewChild('modalLoginSignup') modalLoginSignup: ModalDirective;

  loadAPI: Promise<any>;
  isLogin = true;

  constructor(public authService: AuthenticationService, private notifyService: NotificationService) {
  }

  ngOnInit() {
    this.loadAPI = new Promise((resolve) => {
      this.loadScript();
    });
  }

  public loadScript() {
    const node = document.createElement('script');
    node.src = '/assets/js/homepage.js';
    node.type = 'text/javascript';
    node.async = true;
    node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);

    const node2 = document.createElement('script');
    node2.src = '/assets/js/login.js';
    node2.type = 'text/javascript';
    node2.async = true;
    node2.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node2);

  }

  showLoginModal() {
    this.isLogin = true;
    this.modalLoginSignup.show();
  }

  showSignupModal() {
    this.isLogin = false;
    this.modalLoginSignup.show();
  }

  loggedIn(event) {
    this.modalLoginSignup.hide();
    this.notifyService.printSuccessMessage(event);
  }


}
