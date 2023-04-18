var all_datasources = []
var missing_datasources = []

getAllDataSources_URL_Parameters = async () => {
    let response = await fetch('https://fair.classics.ox.ac.uk/idr_api/datasources.php');
    const data = await response.json();
    //////////////////////////////////
    // Set dropdown list
    datasources = data;
    missing_datasources = datasources.filter(x => x.project_id === null);
    datasources = datasources.filter(x => x.project_id !== null);
    all_datasources = datasources;

    let select = document.getElementsByClassName('selectpicker')[0];
    if (select !== undefined) {
        for (let i = 0; i < datasources.length; i++) {
            select.innerHTML += `<option value="${datasources[i].url_parameter}">${datasources[i].home_page}</option>`
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
}

getURLParameter = async (json_key) => {
    let response = await fetch('https://fair.classics.ox.ac.uk/idr_api/datasources.php');
    const data = await response.json();

    //////////////////////////////////
    // Set dropdown list
    datasources = data; //csvToArray(data)

    let index = datasources.findIndex(x => x.json_key === json_key)
    if (index > -1)
        return datasources[index].url_parameter === 'None' ? null : datasources[index].url_parameter;

    return null;
}

function getPrefix(source) {
    let index = all_datasources.findIndex(x => x.url_parameter === source || x.json_key === source)
    if (index > -1)
        return all_datasources[index].prefix;

    return null;
}

function getProjectId(source) {
    let index = all_datasources.findIndex(x => x.url_parameter === source || x.json_key === source)
    if (index > -1)
        return all_datasources[index].project_id;

    return null;
}

function getFormat(source) {
    let index = all_datasources.findIndex(x => x.url_parameter === source || x.json_key === source)
    if (index > -1)
        return { format: all_datasources[index].id_format, example: all_datasources[index].id_format_exp };

    return { format: null, example: null };
}

getAllDataSources = async () => {
    let response = await fetch('https://fair.classics.ox.ac.uk/idr_api/datasources.php');
    const data = await response.json();
    //////////////////////////////////
    // Set dropdown list
    let datasources = data;//csvToArray(data)
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

function isNumber(Id) {
    if (isNaN(Id)) {
        return false;
    }
    return true;
}