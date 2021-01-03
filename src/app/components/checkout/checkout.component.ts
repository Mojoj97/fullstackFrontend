import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { WebShopFormService } from 'src/app/services/web-shop-form.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;
  creditCardYears: number[] = [];
  creditCardMonth: number[] = [];
  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  
  constructor(private formBuilder: FormBuilder, 
              private webShopFormService: WebShopFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {

    this.reviewCartDetails();
    
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth: " + startMonth);
    this.webShopFormService.getCreditCardMonths(startMonth).subscribe(data => { 
      console.log("Retrieved credit card months: " + JSON.stringify(data));
      this.creditCardMonth = data;
    });

    this.webShopFormService.getCreditCardYearrs().subscribe( data => {
      console.log("Retrieved credit card years: " + JSON.stringify(data));
      this.creditCardYears = data;
    })

    this.webShopFormService.getCountries().subscribe( data =>{
      console.log("Retrieved countries: " + JSON.stringify(data));
      this.countries = data;
    })

  }
  reviewCartDetails() {
    //subscribe to cartService.totalQuantity and totalPrice
    this.cartService.totalQuantity.subscribe(totalQuantity => this.totalQuantity = totalQuantity);
    this.cartService.totalPrice.subscribe(totalPrice => this.totalPrice = totalPrice);
  }

  

  copyShippingAddressToBillingAddress(event) {

    if (event.target.checked) {
      this.checkoutFormGroup.controls.billingAddress
            .setValue(this.checkoutFormGroup.controls.shippingAddress.value);
    }
    else {
      this.checkoutFormGroup.controls.billingAddress.reset();
    }
    
  }

  onSubmit() {
    console.log("Handling the submit button");
    

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    //set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    //get cart items
    const cartItems = this.cartService.cartItems;
    //create orderItems from cartItems
    let orderItems: OrderItem[] = [];
    for (let i=0; i<cartItems.length; i++){
      orderItems[i] = new OrderItem(cartItems[i]);
    }
    //set up purchase
    let purchase = new Purchase();
    //populate purchase for customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
    //populate purchase for shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;
    //populate purchase for billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = shippingState.name;
    purchase.billingAddress.country = shippingCountry.name;
    //populate purchase for order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;
    //call REST API via Checkoutservice
    this.checkoutService.placeOrder(purchase).subscribe({
      next: response => {
        alert(`Your order has been received. \nOrder tracking number: ${response.orderTrackingNumber}`);
        //reset cart
        this.resetCart();
      },

      error: err => {
        alert(`There was an error: ${err.message}`);
      }
    })
    
  }
  resetCart() {
    //reset cart, form navigate back to mainpage
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    this.checkoutFormGroup.reset();

    this.router.navigateByUrl("/products");
  }

  handleMonthsAndYears(){
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);


    let starthMonth: number;

    if(currentYear === selectedYear){
      starthMonth = new Date().getMonth() + 1;
    }
    else{
      starthMonth = 1;
    }
    this.webShopFormService.getCreditCardMonths(starthMonth).subscribe(data => {
      console.log("Retrieved credit card months: " + JSON.stringify(data));
      this.creditCardMonth = data;
    })
  }

  getStates(formGroupName: string){
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;
    console.log(`${formGroupName} Country code: ${countryCode}`);
    console.log(`${formGroupName} Country code: ${countryName}`);

    this.webShopFormService.getStates(countryCode).subscribe( data =>{
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressStates = data;
      }
      else{
        this.billingAddressStates = data;
      }

      formGroup.get('state').setValue(data[0]);
    })
  }
}
