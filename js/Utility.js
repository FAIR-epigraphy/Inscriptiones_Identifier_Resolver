var all_datasources = []

getAllDataSources_URL_Parameters = async () => {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'text/plain; charset=UTF-8');
    let myObject = await fetch('datasources.txt', myHeaders);
    let buffer = await myObject.arrayBuffer();
    const decoder = new TextDecoder('iso-8859-1');
    const data = decoder.decode(buffer);
    //console.log(text);
    //let s = '';

    //////////////////////////////////
    // Set dropdown list
    datasources = csvToArray(data)
    all_datasources = datasources;

    let select = document.getElementsByClassName('selectpicker')[0];
    for (let i = 0; i < datasources.length; i++) {
        select.innerHTML += `<option value="${datasources[i].URL_parameter}">${datasources[i].Homepage}</option>`
    }

    const sorting = document.querySelector('.selectpicker');
    const commentSorting = document.querySelector('.selectpicker');
    const sortingchoices = new Choices(sorting, {
        placeholder: false,
        itemSelectText: ''
    });

    let sortingClass = sorting.getAttribute('class');
    window.onload = function () {
        sorting.parentElement.setAttribute('class', sortingClass);
    }
}

getURLParameter = async (json_key) => {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'text/plain; charset=UTF-8');
    let myObject = await fetch('datasources.txt', myHeaders);
    let buffer = await myObject.arrayBuffer();
    const decoder = new TextDecoder('iso-8859-1');
    const data = decoder.decode(buffer);

    //////////////////////////////////
    // Set dropdown list
    datasources = csvToArray(data)

    let index = datasources.findIndex(x => x.JSON_Key === json_key)
    if (index > -1)
        return datasources[index].URL_parameter;

    return null;
}

function getPrefix(source)
{
    let index = all_datasources.findIndex(x => x.URL_parameter === source)
    if (index > -1)
        return all_datasources[index].prefix;

    return null;
}

getAllDataSources = async () => {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'text/plain; charset=UTF-8');
    let myObject = await fetch('datasources.txt', myHeaders);
    let buffer = await myObject.arrayBuffer();
    const decoder = new TextDecoder('iso-8859-1');
    const data = decoder.decode(buffer);
    //console.log(text);
    //let s = '';

    //////////////////////////////////
    // Set dropdown list
    let datasources = csvToArray(data)
    all_datasources = datasources;

    return datasources;
}

async function getRelations(Id, source) {
    if (source !== null)
        API_URL = `https://www.trismegistos.org/dataservices/texrelations/${Id}?source=${source}`
    else
        API_URL = `https://www.trismegistos.org/dataservices/texrelations/${Id}`

    let myObject = await fetch(API_URL);
    let jsonData = await myObject.json();

    return jsonData;

    //if (source !== null)
    //    return jsonData[0]; //TM ID
    //else
    //    return jsonData;
}
//(async () => {
//    console.log(await getURLParameter('EDB'))
//})()

function convertJSON2CSV(json) {
    const items = json

    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
    const header = Object.keys(items[0])
    const csv = [
        header.join(','), // header row first
        ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n')

    return csv
}