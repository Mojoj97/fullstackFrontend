import { TestBed } from '@angular/core/testing';

import { WebShopFormService } from './web-shop-form.service';

describe('WebShopFormService', () => {
  let service: WebShopFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebShopFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
