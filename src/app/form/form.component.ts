import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  @Input() running: boolean;
  @Input() algorithm: string;
  @Input() nRows: number;
  @Input() nCols: number;
  @Input() hardness: number;
  @Input() speed: number;

  @Output() runningChange = new EventEmitter<boolean>();
  @Output() algorithmChange = new EventEmitter<string>();
  @Output() nRowsChange = new EventEmitter<number>();
  @Output() nColsChange = new EventEmitter<number>();
  @Output() hardnessChange = new EventEmitter<number>();
  @Output() speedChange = new EventEmitter<number>();
  @Output() updateBoard = new EventEmitter<void>();
  @Output() clearBoard = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}
}
