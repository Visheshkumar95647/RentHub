
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { PropertyDetails } from './property-details';
import { of } from 'rxjs';

describe('PropertyDetails', () => {
  let component: PropertyDetails;
  let fixture: ComponentFixture<PropertyDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyDetails],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => 'property-1' },
              queryParamMap: { get: () => null }
            },
            paramMap: of({ get: () => 'property-1' }),
            queryParamMap: of({ get: () => null })
          }
        }
      ]
    })
      .overrideComponent(PropertyDetails, {
        set: { template: '' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PropertyDetails);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
