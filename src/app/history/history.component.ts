import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  @Input() history;

  @Output() historyChange = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  cost(h) {
    return h[3].path.reduce((sum, i) => sum + i.hardness, 0).toFixed(2);
  }
}
