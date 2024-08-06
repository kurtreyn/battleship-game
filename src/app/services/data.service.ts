import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { Student } from '../models/student';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private afs: AngularFirestore, private fireStorage: AngularFireStorage) { }

  addStudent(student: Student) {
    student.id = this.afs.createId()
    return this.afs.collection('/Students').add(student)
  }

  getAllStudents() {
    return this.afs.collection('/Students').snapshotChanges()
  }

  deleteStudent(student: Student) {
    return this.afs.doc('/Students/' + student.id).delete()
  }

  updateStudent(student: Student) {
    this.deleteStudent(student);
    this.addStudent(student);

  }
}