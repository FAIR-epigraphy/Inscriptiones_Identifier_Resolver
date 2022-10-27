function csvToArray(str, delimiter = ",") {

    // slice from start of text to the first \n index
    // use split to create an array from string by delimiter
    const headers = getCSVHeaders(str, delimiter);

    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");

    // Map the rows
    // split values from each row into an array
    // use headers.reduce to create an object
    // object properties derived from headers:values
    // the object passed as an element of the array
    const arr = rows.filter(x => x !== '').map(function (row) {
        if (row !== '') {
            const values = row.replace('\r', '').replace(/\s+/g, ' ').trim().split(delimiter);
            try {
                const el = headers.reduce(function (object, header, index) {
                    object[header.replace('\r', '').replace(/\s+/g, ' ').trim()] = values[index].replace(/"/g, "");
                    return object;
                }, {});

                return el;
            } catch (e) {
                console.log(row)
                console.log(e)
            }
        }
    });

    // return the array
    return arr;
}

//Helper methods

getUniqueValues = (data, key) => Array.from(new Set(data.map(({ [key]: value }) => value)))

getCSVHeaders = (str, delimiter) => {
    return str.slice(0, str.indexOf("\n")).replace(/"/g, "").split(delimiter);
}