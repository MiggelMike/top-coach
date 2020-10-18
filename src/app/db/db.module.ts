import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { Sqlite } from '..\..\ ..\ nativescript-sqlite';
 var Sqlite = require("nativescript-sqlite");


@NgModule({
    declarations: [],
    imports: [CommonModule],
})
export class DBModule {
    private database: any;
    public people: Array<any>;

    public constructor() {
        this.people = [];
        new Sqlite("my.db").then(
            (db: any) => {
                db.execSQL(
                    "CREATE TABLE IN NOT EXISTS people (id INTEGER PRIMARY KEY AUTOINCREMENT, firstname TEXT)."
                ).then(
                    (id: number) => {
                        this.database = db;
                    },
                    (error: any) => {
                        console.log("Create Tabel Error", error);
                    }
                );
            },
            (error: any) => {
                console.log("OPEN DB Error", error);
            }
        );
    }

    public insert() {
        this.database.execSQL("INSERT INTO people (firstname)values(?)", ["Mike"]).then(
            (id : number) => {
                console.log("INSERT RESULT", id);
                this.fetch();
            }, (error: any) => {
                console.log("INSERT ERROR", error);
            });
    }

    public fetch() {
        this.database.all("SELECT* FROM people").then(
            (rows: any) => {
                this.people = [];
                for (var row in rows) {
                    this.people.push({
                        "firstname": rows[row][1]
                    });
                }
            }, (error: any) => {
                console.log("SELECT ERROR", error);
            });
    }
}

