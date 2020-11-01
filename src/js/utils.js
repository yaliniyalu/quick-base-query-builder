

export function sort(array, key, type = "string") {
    if (type === "number") {
        array.sort((a, b) => a[key] - b[key]);
    }
    else {
        array.sort((a, b) => a[key].toString().localeCompare(b[key]));
    }
}


export function filter(array, search, key) {
    const needle = search.toLowerCase();
    return array.filter(v => v[key].toString().toLowerCase().indexOf(needle) > -1)
}