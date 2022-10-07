///////////////////////////////////////////////////
const myForm = document.getElementById("myForm");
const csvFile = document.getElementById("csvFile");
var dataObj = { Homepage: '', URL_parameter: '', JSON_Key: '' };
var selectedColumns = [];
var csvData = [];
var filtereCSVdData = []; // Contains empty TM IDs data
var play = true;
var loopIndex = 0
var dwonloadFile = []
var jsonRecords = ''

$('#btnFetchData').hide();
$("#divDetail").hide()

function clickFile() {
    csvFile.click();
}

function selectFile() {
    try {
        if (csvFile.files.length > 0) {

            loading(true);

            const input = csvFile.files[0];
            const reader = new FileReader();

            document.getElementById('fileName').value = input.name;

            reader.onload = function (event) {
                const text = event.target.result;
                const data = csvToArray(text);

                records = []
                records = data.filter(x => {
                    for (let key of Object.keys(x)) {
                        if (key === 'Id') continue
                        if (x[key] !== null && x[key] != "")
                            return true
                    }
                    return false
                });

                records = records.filter(x => x.Trismegistos === '' || x.TM_ID === '')
                csvData = data;
                jsonRecords = JSON.stringify(records)
                filtereCSVdData = records
                $('#page-selection').pagination({
                    dataSource: records,
                    pageSize: 13,
                    showNavigator: true,
                    formatNavigator: '<%= totalNumber %> total results',
                    callback: function (data, pagination) {
                        let content = loadData(data)

                        document.getElementById('dataHeader').innerHTML = content[1];
                        document.getElementById('rowData').innerHTML = content[0];
                    }
                });
                loading(false);
                csvFile.value = '';
            };

            reader.readAsText(input);
        }
        else {

        }
    } catch (e) {
        console.error(e)
        csvFile.value = '';
    }

}

function loadData(data) {
    let dataHeader = '<tr>';
    let rowData = '';

    //Display Header
    for (let header of Object.keys(data[0])) {
        if (header !== 'processed') {
            dataHeader +=
                `<th>
                ${(header.toLowerCase() !== 'id' && (header.toLowerCase() !== 'trismegistos' && header.toLowerCase() !== 'tm_id')) ? `<input class="form-check-input" type="checkbox" value="${header}" id="chkColumn_${header}" onclick="checkedColumn(this)" />` : ''}
                 <label class="form-check-label" for="chkColumn_${header}">${header}</label>
            </th>`
        }
    }

    dataHeader += '</tr>'

    for (let d of data) {
        const { ['processed']: omitted, ...rest } = d;
        let keys = Object.keys(rest);
        let tm_null_data = ''
        for (let key of keys) {
            tm_null_data += `<td>${d[key]}</td>`
        }
        rowData += `<tr>${tm_null_data}</tr>`
    }

    return [rowData, dataHeader]
}

function checkedColumn(control) {
    if (control.checked) {
        selectedColumns.push(control.value)
    }
    else {
        selectedColumns.splice(selectedColumns.findIndex(x => x === control.value), 1)
    }

    selectedColumns.length === 0 ? $('#btnFetchData').hide() : $('#btnFetchData').show()
}

//////////////////////////////////////////////////////////////////////////////////////////
// Fetching data from the API
async function FetchDataFromAPI(control) {
    $('#btnProgressClose').hide();
    disabledAllActionButtons()
    enableActionButton('pause')
    updateStats()
    play = true;
    let found = 0;
    let object = {}

    //for (let d of filtereCSVdData) {
    for (; loopIndex < filtereCSVdData.length; loopIndex++) {
        if (play === false) break;

        let d = filtereCSVdData[loopIndex]
        let keys = Object.keys(d);
        for (let key of keys) {
            if (selectedColumns.filter(x => x === key).length > 0) {
                updateDetails(d['Id'], key, d[key], '', 'before')
                if (d[key] !== undefined && d[key] !== '') {
                    //console.log(d['Id'] + ' GAP ' + getNumber(d[key]))
                    let Obj_TM_ID = await getRelations(getPrefix(getNumber(d[key]), key), await getURLParameter(key))
                    let TM_ID = Obj_TM_ID === undefined || Obj_TM_ID === null ? 'N/A' : Object.values(Obj_TM_ID)[0][0]

                    //console.log(Object.values(TM_ID)[0][0])
                    d.processed = true;
                    object = {}
                    object['Id'] = d['Id']
                    object['TM_ID'] = TM_ID
                    for (let col of selectedColumns) {
                        object[col] = '';
                    }
                    object[key] = getNumber(d[key])
                    dwonloadFile.push(object)
                    updateDetails(d['Id'], key, d[key], TM_ID, 'after')
                    found++
                    break;
                }
            }
        }
        updateStats()
        if (found === 30) {
            updateDetails(null, null, null, null, 'Process completed...')
            break;
        }
        
    }

    if (filtereCSVdData.length === loopIndex)
        updateDetails(null, null, null, null, 'Process completed...')
}

function getPrefix(Id, source) {
    if (source.toLowerCase() === 'edr') {
        return `EDR${Id}`
    }
    return Id;
}

function updateDetails(Id, source, sourceId, tmId, status) {
    if (status === 'before')
        document.getElementById('divDetail').innerHTML += `<p>Fetch TM ID for ${Id} using ${source}: ${sourceId === '' ? 'N/A' : sourceId}</p>`
    else if (status === 'after')
        document.getElementById('divDetail').innerHTML += `<p>Fetched TM ID: ${tmId} for ${Id} using ${source}: ${sourceId}</p>`
    else if (status.includes('complete')) {
        document.getElementById('divDetail').innerHTML += `<p>${status}</p>`
        disabledAllActionButtons()
        enableActionButton('download')
        $('#btnProgressClose').show()
    }
    else {
        document.getElementById('divDetail').innerHTML += `<p>${status}</p>`
    }

    document.getElementById('divDetail').scrollTop = document.getElementById('divDetail').scrollHeight
}

function updateStats() {
    let processed = filtereCSVdData.filter(x => x.processed !== undefined).length
    document.getElementById('cntProcessed').innerHTML = `${processed}/${filtereCSVdData.length} processed...`;

    let percentage = parseInt((processed / filtereCSVdData.length) * 100)

    document.getElementById('perProcessed').innerHTML = `<div class="progress-bar progress-bar-striped progress-bar-animated" style="width:${percentage}%">${percentage}%</div>`
}

function getNumber(Id) {
    if (isNaN(Id)) {
        return Id.replace(/(^\d+)(.+$)/i, '$1')
    }
    return Id;
}

function disabledAllActionButtons() {
    Array.from(document.getElementById('divActionButtons').children).forEach(child => {
        child.classList.add('disabled')
        child.classList.remove('enabled')
    })
}
function enableActionButton(className) {
    Array.from(document.getElementById('divActionButtons').children).forEach(child => {
        if (Array.from(child.classList).filter(x => x.includes(className)).length > 0) {
            child.classList.remove('disabled')
            child.classList.add('enabled')
        }
    })
}

function resetAll() {
    loopIndex = 0;
    selectedColumns = []
    dwonloadFile = []
    $('#btnFetchData').hide()
    Array.from(document.getElementsByClassName('form-check-input')).forEach(cls => {
        cls.checked = false
    })
    document.getElementById('divDetail').innerHTML = '';
    $("#divDetail").hide()
    filtereCSVdData = JSON.parse(jsonRecords)
}

function action(control, event) {
    if (control.classList.contains('enabled')) {
        if (event === 'play') {
            play = true;
            disabledAllActionButtons()
            enableActionButton('pause')
            updateDetails(null, null, null, null, 'Process started again...')
            FetchDataFromAPI(null)
        }
        else if (event === 'pause') {
            play = false;
            //Disable pause button
            disabledAllActionButtons()
            enableActionButton('play')
            enableActionButton('download')
            updateDetails(null, null, null, null, 'Process paused...')
        }
        else if (event === 'download') {
            let csv = convertJSON2CSV(dwonloadFile)
            const contentType = 'text/csv;charset=utf-8;';
            const a = document.createElement('a');
            const file = new Blob([csv], { type: contentType });
            const filename = `tmIds.csv`;

            a.href = URL.createObjectURL(file);
            a.download = filename;
            a.click();

            URL.revokeObjectURL(a.href);

            updateDetails(null, null, null, null, `${filename} has been downloaded...`)
            //location.reload();
        }
    }
}

function showDetailDiv(control) {
    $("#divDetail").toggle("slow", function () {
        // check paragraph once toggle effect is completed
        if ($("#divDetail").is(":visible")) {
            $("#divDetail").show()
            document.getElementById('divDetail').scrollTop = document.getElementById('divDetail').scrollHeight
        } else {
            $("#divDetail").hide()
        }
    });
}
//////////////////////////////////////////////////////////////////////////////////////////

function loading(flag) {
    if (flag) {
        document.getElementById('btnBrowse').innerHTML = `<div class="spinner-border text-light" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>`;
        document.getElementById('btnBrowse').disabled = true
    }
    else {
        document.getElementById('btnBrowse').innerHTML = `<i class="bi bi-filetype-csv fs-3"></i> Browse`;
        document.getElementById('btnBrowse').disabled = false
    }
}
///////////////////////////////////////////////////////////////////
