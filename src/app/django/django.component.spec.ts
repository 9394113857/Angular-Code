import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DjangoComponent } from './django.component';

describe('DjangoComponent', () => {
  let component: DjangoComponent;
  let fixture: ComponentFixture<DjangoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DjangoComponent]
    });
    fixture = TestBed.createComponent(DjangoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
