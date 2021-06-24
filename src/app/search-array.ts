const bubbleUp = (array, index, weightKey) => {
  const parent = Math.floor((index - 1) / 2);
  if (!array[parent]) return;
  if (array[index][weightKey] < array[parent][weightKey])
    [array[index], array[parent]] = [array[parent], array[index]];
  else return;
  bubbleUp(array, parent, weightKey);
};

const bubbleDown = (array, index, weightKey) => {
  if (!array[index]) return;
  const [a, b] = [index * 2 + 1, index * 2 + 2];
  const better = (a, b) =>
    array[a] && (!array[b] || array[b][weightKey] >= array[a][weightKey]);
  const child = better(a, b) ? a : better(b, a) ? b : null;
  if (child === null) return;
  [array[child], array[index]] = [array[index], array[child]];
  return bubbleDown(array, child, weightKey);
};

const push = (weightKey, heuristicFnc) => ({
  dfs(item) {
    this.splice(0, 0, item);
  },
  bfs(item) {
    this._push(item);
  },
  dijkstra(item) {
    this._push(item);
    if (weightKey) bubbleUp(this, this.length - 1, weightKey);
  },
  aStar(item) {
    this._push(item);
    if (weightKey) {
      bubbleUp(this, this.length - 1, weightKey);
    }
  }
});

const pop = weightKey => ({
  dfs() {
    return this.splice(0, 1)[0];
  },
  bfs() {
    return this.splice(0, 1)[0];
  },
  dijkstra() {
    const res = this[0];
    this[0] = this[this.length - 1];
    this.splice(this.length - 1, 1);
    bubbleDown(this, 0, weightKey);
    return res;
  },
  aStar() {
    const res = this[0];
    this[0] = this[this.length - 1];
    this.splice(this.length - 1, 1);
    bubbleDown(this, 0, weightKey);
    return res;
  }
});

export class SearchArray extends Array {
  _push;
  _pop;
  constructor(type, heuristicFnc?) {
    super();
    this._pop = this.pop;
    this._push = this.push;
    this.push = push('weight', heuristicFnc)[type];
    this.pop = pop('weight')[type];
  }

  pushAll = (...items) => {
    for (let item of items) this.push(item);
  };
}
