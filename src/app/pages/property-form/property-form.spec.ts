
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { PropertyForm } from './property-form';
import { of } from 'rxjs';

describe('PropertyForm', () => {
  let component: PropertyForm;
  let fixture: ComponentFixture<PropertyForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyForm],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => null },
              queryParamMap: { get: () => null }
            },
            paramMap: of({ get: () => null }),
            queryParamMap: of({ get: () => null })
          }
        }
      ]
    })
      .overrideComponent(PropertyForm, {
        set: { template: '' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PropertyForm);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
