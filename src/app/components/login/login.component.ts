import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/users';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private userDetail = new User();

  constructor(
    private userService: UserService, 
    private router: Router
  ){}

  ngOnInit(){
    if(this.userService.isLoggedIn()){
      this.router.navigate(['/product', localStorage.getItem('id')]);
    }
  }

  form = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required), 
  });

  Login(LogInformation){
    this.userDetail.username = this.Username.value;
    this.userDetail.password = this.Password.value;
  

    this.userService.login(this.userDetail).subscribe(
      response =>{
        let result = response.json();

        if(result > 0){
          let token = response.headers.get("Authorization");

          localStorage.setItem("token", token);
          localStorage.setItem("id", result);

          this.router.navigate(['/product',result]);
        }
        if(result == -1){
          alert("plese register before login Or invalid combination");
        }
      },
      error =>
      {
        console.log("Error in authentication");
      }
    );
  }

  get Username(){
    return this.form.get('username');
  }

  get Password(){
    return this.form.get('password');
  }
}
