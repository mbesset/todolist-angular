import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from './../auth/auth.service';
import { AlertService } from './../alert/alert.service';

@Component({
  selector: 'td-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  returnUrl: string;

  constructor(
    private formBuilder: FormBuilder, 
    private auth: AuthService, 
    private alert: AlertService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    if (this.auth.alreadyConnected()) {
      this.router.navigate(['/']);
    }

    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      rememberMeState: ['']
    });

    let rememberMeValue = (this.auth.getRememberMeState() == "true");
    this.loginForm.controls['rememberMeState'].setValue(rememberMeValue);
    
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  logIn() {
    this.submitted = true;
    this.loading = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      this.loading = false;
      return;
    }

    this.auth.logIn(this.loginForm.value)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate([this.returnUrl]);
          this.alert.showSuccess("You are now connected");
        },
        error => {
          let errors = this.alert.decodeError(error, this.loginForm);
          this.alert.showError(errors);
          this.loading = false;
          this.loginForm.controls['password'].setValue("");
        });
  }

  rememberMe() {
    localStorage.setItem("rememberMeState", this.loginForm.controls['rememberMeState'].value);
  }
}
