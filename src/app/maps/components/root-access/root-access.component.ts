import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';

@Component({
  selector: 'root-access',
  templateUrl: './root-access.component.html',
  styleUrls: ['./root-access.component.scss']
})
export class RootAccessComponent {
  public login = false;
  constructor(private afAuth: AngularFireAuth, private router: Router) {}
  
  public userLogin() {
    this.login = true;
    this.afAuth.signInWithPopup(new GoogleAuthProvider())
      .then(() => {
        this.router.navigate(['/add-locations']);
      })
      .catch(() => {
        this.login = false;
        this.router.navigate(['/']);
    });
  }

}
