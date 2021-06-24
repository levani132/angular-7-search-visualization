import {
  Component,
  ChangeDetectorRef,
  ViewEncapsulation,
  HostBinding,
  HostListener
} from '@angular/core';
import { SearchArray } from './search-array';

const N_ROWS = 15;
const N_COLS = 15;
const MAX_HARDNESS = 10000;
const APPEAR_DURATION = 5000;

class Cell {
  constructor(
    public appComponent: AppComponent,
    public boardWrapper: BoardWrapper,
    public x,
    public y,
    public hardness = Math.random() > 0.6 ? Math.random() * MAX_HARDNESS : 0,
    public state: 'current' | 'seen' | 'empty' = 'empty',
    public type: 'start' | 'search' = null,
    public weight = Infinity,
    public path = [],
    public appearAfter = Math.random() * APPEAR_DURATION,
    public pathWalked = Infinity
  ) {}

  get children() {
    let res: any = this.appComponent
      .range(this.x - 1, this.x + 2)
      .map(x =>
        this.appComponent
          .range(this.y - 1, this.y + 2)
          .map(
            y =>
              x >= 0 &&
              y >= 0 &&
              x < this.boardWrapper.board[0].length &&
              y < this.boardWrapper.board.length &&
              (x !== this.x || y !== this.y) &&
              (x === this.x || y === this.y) &&
              this.boardWrapper.board[y][x].state !== 'seen' &&
              this.boardWrapper.board[y][x]
          )
      );
    res = res.flat().filter(item => item);
    return res;
  }

  get color() {
    if (this.is('start')) return 'green';
    if (this.is('search')) return 'red';
    if (this.boardWrapper.path[this.y][this.x])
      return `rgb(${this.white}, 0, ${this.white})`;
    if (this.is('current')) return `rgb(0, 0, ${this.white})`;
    if (this.is('seen')) return `rgb(${this.white}, ${this.white}, 0)`;
    const res = `rgb(${this.white}, ${this.white}, ${this.white})`;
    return res;
  }

  get white() {
    const hardness = this.hardness / MAX_HARDNESS;
    return ((1 - hardness) * 255).toFixed();
  }

  is(typeOrState) {
    return [this.type, this.state].includes(typeOrState);
  }

  addHardness() {
    this.hardness = this.hardness === MAX_HARDNESS ? 0 : MAX_HARDNESS;
  }
}

class BoardWrapper {
  constructor(public board?: Cell[][], public path?: boolean[][]) {}
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  nRows = N_ROWS;
  nCols = N_COLS;
  history: [Cell[][], boolean[][], Cell, Cell][] = [];
  board: Cell[][] = [];
  pathBoard: boolean[][] = [];
  start;
  search;
  running = false;
  finished = false;
  boardWrapper: BoardWrapper = new BoardWrapper();
  algorithm: 'dfs' | 'bfs' | 'dijkstra' | 'aStar' = 'aStar';
  maxHardness = MAX_HARDNESS;
  speed: number = 500;
  mousedown = false;
  inf = Infinity;

  @HostBinding('style.position') position = 'relative';
  @HostBinding('style.display') display = 'block';
  @HostBinding('style.overflow') overflow = 'hidden';
  @HostBinding('style.width.vw') width = 100;

  @HostListener('mousedown')
  startMoving() {
    this.mousedown = true;
  }

  @HostListener('mouseup')
  endMoving() {
    this.mousedown = false;
  }

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    this.initBoard();
  }

  initBoard() {
    this.running = false;
    this.boardWrapper = new BoardWrapper();
    this.board = this.range(+this.nRows).map((row, y) =>
      this.range(+this.nCols).map((column, x) => {
        const res = new Cell(
          this,
          this.boardWrapper,
          x,
          y,
          (10000 / this.maxHardness) *
            +(Math.random() > 0.6
              ? Math.random() * this.maxHardness
              : 0
            ).toFixed(0)
        );
        return res;
      })
    );
    this.boardWrapper.board = this.board;
    this.clearPathBoard();
    const randBetween = (a, b) => Math.floor(Math.random() * (b - a)) + a;
    const startX = randBetween(0, +this.nCols),
      startY = randBetween(0, +this.nRows),
      searchX = randBetween(0, +this.nCols),
      searchY = randBetween(0, +this.nRows);
    this.start = this.board[startY][startX];
    this.search = this.board[searchY][searchX];
    this.start.type = 'start';
    this.start.weight = 0;
    this.start.hardness = 0;
    this.start.path = [this.start];
    this.search.type = 'search';
    this.search.hardness = 0;
  }

  updateBoard() {
    this.finished = false;
    this.initBoard();
  }

  clearPathBoard() {
    this.pathBoard = this.range(this.board?.length).map(() =>
      this.range(this.board?.[0]?.length).map(() => null)
    );
    this.boardWrapper.path = this.pathBoard;
  }

  fillPathBoard(cells: Cell[]) {
    this.clearPathBoard();
    cells.forEach(cell => (this.pathBoard[cell.y][cell.x] = true));
  }

  range(start, stop?, step = 1) {
    if (stop === undefined) {
      stop = start;
      start = 0;
    }
    return new Array((stop - start) / step).fill(0).map((elem, i) => start + i);
  }

  contains(i, j) {
    return true;
  }

  sleep(millis) {
    return new Promise(resolve => {
      setTimeout(resolve, millis);
    });
  }

  onClickCell(cell: Cell) {
    cell.addHardness();
    this.cdr.detectChanges();
  }

  onClear() {
    this.board.forEach(row =>
      row.forEach(cell => {
        cell.hardness = 0;
      })
    );
    this.cdr.detectChanges();
  }

  onChooseHistory(hist) {
    [
      this.board,
      this.pathBoard,
      this.start,
      this.search,
      this.nRows,
      this.nCols
    ] = [...hist, hist[0].length, hist[0][0].length];
    this.cdr.detectChanges();
  }

  startSearch() {
    if (!this.running) {
      if (this.finished) this.initBoard();
      this.finished = false;
      this.onSearch(this.start, this.search, this.algorithm);
    } else this.running = false;
  }

  async onSearch(
    tree: any,
    searchItem: any,
    type: 'dfs' | 'bfs' | 'dijkstra' | 'aStar'
  ) {
    this.running = true;
    const h = item =>
      Math.abs(searchItem.x - item.x) + Math.abs(searchItem.y - item.y);
    const arr = new SearchArray(type, h);
    arr.push(tree);
    tree.pathWalked = 0;
    while (arr.length) {
      if (!this.running) break;
      const item = arr.pop();
      this.fillPathBoard(item.path);
      if (item.x === this.search.x && item.y === this.search.y) break;
      if (item.state === 'seen') continue;
      const children = item.children
        .map(child => {
          const pathWalked = item.pathWalked + child.hardness + 1;
          if (!['dfs', 'bfs'].includes(type) && child.pathWalked <= pathWalked || child.hardness === MAX_HARDNESS) {
            return;
          }
          child.pathWalked = pathWalked;
          child.weight = pathWalked + (type === 'aStar' ? h(child) : 0);
          child.path = [...item.path, child];
          child.state = 'current';
          return child;
        })
        .filter(child => !!child);
      arr.pushAll(...children);
      item.state = 'seen';
      this.cdr.detectChanges();
      await this.sleep(1000 - this.speed);
    }
    this.history.splice(0, 0, [
      this.board,
      this.pathBoard,
      this.start,
      this.search
    ]);
    this.running = false;
    this.finished = true;
    this.cdr.detectChanges();
  }
}
