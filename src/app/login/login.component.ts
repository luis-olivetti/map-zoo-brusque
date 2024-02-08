import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public username: string = '';
  public password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    const isAuthenticated = this.authService.login(this.username, this.password);

    if (isAuthenticated) {
      this.router.navigate(['/marker-list']);
    } else {
      alert('Login falhou. Verifique suas credenciais.');
    }
  }
}
