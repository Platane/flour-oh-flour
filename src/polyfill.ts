// @ts-ignore
Array.prototype.flat = function (d: number) {
  // @ts-ignore
  const c = this.concat.apply([], this);
  return d > 1 && c.some(Array.isArray) ? c.flat(d - 1) : c;
};
