import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Machine } from '../model/machine';
import { MachineService } from '../service/machine.service';
import { MatSort, MatPaginator, MatInputModule } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FailureService } from '../service/failure.service';
import { Failure } from '../model/failure';
//import { FileUploader } from 'ng2-file-upload';
import { MachineWrapper } from '../model/machineWrapper';

//import 'bootstrap/dist/css/bootstrap.min.css';
//import 'bootstrap/dist/js/bootstrap.min.js';



@Component({
  selector: 'app-machine',
  templateUrl: './machine.component.html',
  styleUrls: ['./machine.component.scss']
})
export class MachineComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  machineId: number;
  machines: Machine[] = [];
  machine: Machine;
  makina: Machine;
  machineForm: FormGroup;
  host: string;

  displayedColumns: string[] = ['machine.position', 'machine.name', 'machine.type', 'machine.manufacturer', 'failureCount'];
  dataSource = new MatTableDataSource<Machine>([]);

  /* dataSource = new MatTableDataSource<MachineWrapper>([]); */

  //uploader: FileUploader = new FileUploader({});

  @ViewChild(MatSort, { static: true }) sort: MatSort;


  constructor(
    private router: Router,
    private machineService: MachineService,
    private failureService: FailureService,
    private formBuilder: FormBuilder) {
    console.log("In constructor");
  }

  createForm() {
    this.machineForm = this.formBuilder.group({
      machine: this.formBuilder.group({
        name: '',
        type: '',
        manufacturer: ''
      }),
      failures: this.formBuilder.array([])
      /* failures: this.formBuilder.array([this.failures]) */
    });
  }

  ngOnInit() {
    this.createForm();
    this.getMachines();
    this.machineForm.valueChanges.subscribe(console.log);
  }

  onSubmit() {
    console.log("submiting");
  }

  get failures(): FormGroup {
    return this.formBuilder.group({
      title: "",
      description: "",
      priority: "",
      status: "",
      files: this.formBuilder.array([])
    });
  }

 /*  get title() {
    console.log("for title");
    this.failures.valueChanges.subscribe(
    )

    return true;
  } */

 /*  validateForDescription(formControl: AbstractControl) {
    if (!formControl.parent) {
      return null;
    }
    if (formControl.parent.get('title').value.length > 5) {
      console.log("CHECKED");
    }
    return null;
  } */

  get files(): FormGroup {
    return this.formBuilder.group({
      files: ""/* [this.upload()] */
    });
  }

  addFailure() {
    console.log("Clicked");
    (this.machineForm.get("failures") as FormArray).push(this.failures);
  }

  deleteFailure(index) {
    (this.machineForm.get("failures") as FormArray).removeAt(index);
  }

  addFile(failure) {
    failure.get("files").push(this.files);
  }

  deleteFile(failure, index) {
    failure.get("files").removeAt(index);
  }

  getMachines(): any {
    this.subscriptions.push(this.machineService.getMachines().subscribe(
      response => {
        /*      (response: MachineWrapper[]) => { 
         
        this.dataSource = new MatTableDataSource(response);

                  response. */


                  this.machines = response;
                  this.dataSource = new MatTableDataSource(response);


        /*   
   
            this.machines.forEach(machine => {
             console.log(machine.name);
             this.checkForFailures(machine.name);
             
           }); */
        console.log(response);
      },
      error => {
        console.log(error);
      }
    ));
  }

  saveMachine(machine?: Machine): void {
    console.log(machine);
    console.log(this.machineForm.value);

    this.machine = this.machineForm.value;

    this.subscriptions.push(this.machineService.addMachine(this.machine).subscribe(
      response => {
        console.log(response);
        console.log("Machine saved to database!");
        this.router.navigateByUrl("/machine");
      }, error => {
        console.log(error);
      }
    ));
  }

  /*   upload() {
      for (let i = 0; i < this.uploader.queue.length; i++) {
        let fileItem = this.uploader.queue[i]._file;
        if (fileItem.size > 5000000) {
          alert("Each File should be less than 5 MB of size.");
          return;
        }
      }
      for (let j = 0; j < this.uploader.queue.length; j++) {
        let data = new FormData();
        let fileItem = this.uploader.queue[j]._file;
        console.log(fileItem.name);
        data.append('file', fileItem);
        data.append('fileSeq', 'seq' + j);
        data.append('dataType', this.files.controls.type.value);
      }
      this.uploader.clearQueue();
    }
   */
  checkForFailures(machineName: string) {
    console.log("Checking if has unresolved failures for machine name:");
    console.log(machineName);
    this.subscriptions.push(this.failureService.checkForUnresolved(machineName).subscribe(
      response => {
        console.log(response);
      }, error => {
        console.log(error);
      }
    ))
  }

  discard() {
    console.log("redirect to machiine view");
    this.router.navigateByUrl("/machine");
    window.location.reload();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
