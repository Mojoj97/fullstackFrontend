import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { User } from 'src/app/users';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private userDetail = new User();

  constructor(private user: UserService, private router: Router){ }

  ngOnInit(){}
    form = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required)
    });

  UserForm(UserInformation){
    let pass = this.Password.value;
    let confirmPass = this.ConfirmPassword.value;

    if(pass == confirmPass){
      this.userDetail.username = this.Username.value;
      this.userDetail.password = this.Password.value;
      this.userDetail.firstName = this.FirstName.value;
      this.userDetail.lastName = this.LastName.value;

    this.user.saveUser(this.userDetail).subscribe(
      response =>{
        let result = response.json();

        if(result > 0){
          this.router.navigate(['/login']);
        }
        else{
          alert("error hile register User. Please try again!")
        }
      },
      error =>
      {
        alert("error hile register User. Please try again!")
      }
    );
    }
    else
    {
      alert("Password and confirm Password not match");
    }

  }

  get Username(){
    return this.form.get('username');
  }

  get Password(){
    return this.form.get('password');
  }

  get ConfirmPassword(){
    return this.form.get('confirmPassword');
  }

  get FirstName(){
    return this.form.get('firstName');
  }

  get LastName(){
    return this.form.get('lastName');
  }

}
