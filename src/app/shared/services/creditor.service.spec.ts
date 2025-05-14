import { TestBed } from '@angular/core/testing';

import { CreditorService } from './creditor.service';

describe('CreditorService', () => {
  let service: CreditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
