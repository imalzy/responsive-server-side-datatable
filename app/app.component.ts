import {
  AfterViewInit,
  Component,
  OnInit,
  VERSION,
  ViewChild
} from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";

class Person {
  id: number;
  firstName: string;
  lastName: string;
}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit, AfterViewInit {
  version = "Angular: v" + VERSION.full;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  persons: Person[];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const that = this;
    this.dtOptions = {
      pagingType: "full_numbers",
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        console.log(dataTablesParameters);

        that.http
          .post<DataTablesResponse>(
            "https://angular-datatables-demo-server.herokuapp.com/",
            dataTablesParameters,
            {}
          )
          .subscribe(resp => {
            that.persons = resp.data;
            console.log(this.persons);

            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: []
            });
          });
      },
      columns: [{ data: "id" }, { data: "firstName" }, { data: "lastName" }]
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }
}
