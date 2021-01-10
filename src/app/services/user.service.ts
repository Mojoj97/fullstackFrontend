import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { User } from 'src/app/users';

@Injectable({ providedIn: 'root' })
export class UserService {
    private baseUrl = "http://localhost8080/api";
    constructor(private http: Http, private router: Router) { }

    saveUser(userDetail: User): Observable<any>{
        let url = this.baseUrl + "saveUser";
        return this.http.post(url, userDetail);
    }

    login(userDetail: User): Observable<any>{
        let url = this.baseUrl + "login";
        return this.http.post(url, userDetail);
    }

    logout(){
        localStorage.removeItem('token');
        this.router.navigate(['']);
    }

    isLoggedIn(){
        let token = localStorage.getItem('token');

        if(!token){
            return false;
        }
        else{
            return true;
        }
    }


    getUser(id): Observable<any>{
        let url = this.baseUrl + "getUser/" + id;
        
        let headers = new Headers();

        let token = localStorage.getItem('token');

        headers.append('Authorization','Bearer' + token);

        let options = new RequestOptions({headers: headers});

        return this.http.get(url, options);
    }
   
}