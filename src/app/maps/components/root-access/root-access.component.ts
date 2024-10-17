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
  constructor(private readonly _afAuth: AngularFireAuth, private readonly _router: Router) {}
  
  public userLogin() {
    this.login = true;
    this._afAuth.signInWithPopup(new GoogleAuthProvider())
      .then(() => {
        this._router.navigate(['/add-locations']);
      })
      .catch(() => {
        this.login = false;
        this._router.navigate(['/']);
    });
  }

}
