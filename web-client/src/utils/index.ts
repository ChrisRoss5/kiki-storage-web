export function isObject(item: any) {
  return item && typeof item === "object" && !Array.isArray(item);
}

export function mergeDeep(target: any, ...sources: any) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

// Created because of slicksort's v-model
/* type Getter<T> = () => T;
type Setter<T> = (value: T) => Promise<void>;
function asyncWritableComputed<T>(getter: Getter<T>, setter: Setter<T>) {
  let isSaving = false;
  return computed({
    get: getter,
    async set(value: T) {
      if (isSaving) return;
      isSaving = true;
      await setter(value);
      isSaving = false;
    },
  });
} */
