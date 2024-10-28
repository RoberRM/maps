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
  public showEmailLoginForm = false;
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

  public showEmailLogin() {
    this.showEmailLoginForm = !this.showEmailLoginForm;
  }

  public emailLogin(email: string, password: string): void {
    this.login = true;
    this._afAuth.signInWithEmailAndPassword(email, password)
      .then(() => {
        this._router.navigate(['/add-locations']);
      })
      .catch(error => {
        this.login = false;
        if (error.code === 'auth/invalid-credential') {
          alert('Credenciales incorrectas. Verifique su correo y contraseña.');
        } else if (error.code === 'auth/user-not-found') {
          alert('Usuario no encontrado. Verifique su correo o regístrese.');
        } else {
          alert('Ha ocurrido un error inesperado. Intente nuevamente.');
        }
        setTimeout(() => {
          console.clear();
        }, 0)
      });
  }

}
