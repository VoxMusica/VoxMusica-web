export class VMSet<T> extends Set<T> {
  filter(predicate: (value: T) => boolean): VMSet<T> {
    const result = new VMSet<T>();
    for (const value of this) {
      if (predicate(value)) result.add(value);
    }
    return result;
  }

  map<U>(fn: (value: T) => U): VMSet<U> {
    const result = new VMSet<U>();
    for (const value of this) {
      result.add(fn(value));
    }
    return result;
  }

  some(predicate: (value: T) => boolean): boolean {
    for (const value of this) {
      if (predicate(value)) return true;
    }
    return false;
  }

  join(separator = ','): string {
    return [...this].join(separator);
  }

  reduce<U>(fn: (accumulator: U, value: T) => U, initialValue: U): U {
    let acc = initialValue;
    for (const value of this) {
      acc = fn(acc, value);
    }
    return acc;
  }

  toJSON() {
    return [...this];
  }
}
