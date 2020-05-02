import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  page: any = 'login';
  user: any = {
    name: '',
    password: ''
  };
  constructor(private fire: FirebaseService, private router: Router) { }

  ngOnInit() {

  }

  login() {
    if (this.page=='login') {
      this.fire.doLogin(this.user).subscribe((x) => {
        if (x.size === 0) {
          this.fire.presentToast('Invalid username or password!');
        } else {
          this.fire.presentToast('Logged in successfully');
          localStorage.setItem('userId', x.docs[0].id);
          this.user = {};
          this.router.navigate(['/home']);
        }
      });
    } else {
      this.fire.doRegister(this.user).then((x) => {
        if (x.id) {
          this.fire.presentToast('User registered successfully');
          localStorage.setItem('userId', x.id);
          this.user = {};
          this.router.navigate(['/home']);
        } else {
          this.fire.presentToast('Something went wrong');
        }
      })
    }
  }

  

}
