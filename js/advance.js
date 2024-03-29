///////////////////////////////////////////////////
const myForm = document.getElementById("myForm");
const csvFile = document.getElementById("csvFile");
var dataObj = { home_page: '', url_parameter: '', json_key: '' };
var selectedColumns = [];
var csvData = [];
var filtereCSVdData = []; // Contains empty TM IDs data
var play = true;
var loopIndex = 0
var dwonloadFile = []
var jsonRecords = ''
var selectedOutputSources = [];
var sources = [];


(async () => {
    await getAllDataSources();
})();

$('#btnFetchData').hide();
$("#divDetail").hide();
$('#btnApplySelectedSources').hide();

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

                csvData = data;
                jsonRecords = JSON.stringify(csvData)
                checkDatasourceIdFormat(Object.keys(csvData[0]).filter(x => x.toLowerCase() !== 'id'));
                //filtereCSVdData = records
                $('#page-selection').pagination({
                    dataSource: csvData,
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

function checkDatasourceIdFormat(header) {
    let table = '';
    for (let h of header) {

        table += `<tr>
                    <td>${h}</td>
                    <td>${showFormatMsg(h)}</td>
                  </tr>`;
    }

    $('#errorMsg').html(table);
    let myModal = new bootstrap.Modal(document.getElementById('modalError'));
    myModal.show()
}

function showFormatMsg(source) {
    let span = '';
    let prefix = getPrefix(source);
    let projectId = getProjectId(source);
    const { format, example } = getFormat(source)
    // if (format !== null) {
    //     span = `<i class="bi bi-info-circle-fill text-warning"></i> ${format}`;
    //     if (example !== null)
    //         span += ` e.g., ${example}`;
    // }
    // else
    if (projectId !== '' && projectId !== null) {
        if (!isNumber(projectId)) {
            span = `<i class="bi bi-info-circle-fill text-warning"></i> ID format should be in alphanumeric format. e.g., ${projectId}. `;
            if (prefix !== '') {
                span += `<span class="text-danger">Please don't enter prefix <em><b>${prefix}</b></em></span>`;
            }
        }
        else {
            span = `<i class="bi bi-info-circle-fill text-warning"></i> ID format should be in number format. e.g., ${projectId}`;
        }
    }
    else {
        span = `<i class="bi bi-x-circle-fill text-danger"></i> This datasource key is not supported and will not be selectable in grid.`;
    }

    return span;
}

function loadData(data) {
    let dataHeader = '<tr>';
    let rowData = '';

    //Display Header
    for (let header of Object.keys(data[0])) {
        if (header !== 'processed') {
            dataHeader +=
                `<th>
                ${(header.toLowerCase() !== 'id'
                    //&& (header.toLowerCase() !== 'trismegistos' && header.toLowerCase() !== 'tm_id')
                    && getProjectId(header) !== '' && getProjectId(header) !== null
                ) ?
                    `<input class="form-check-input headerCheckbox" type="checkbox" value="${header}" id="chkColumn_${header}" onclick="checkedColumn(this)" />` : ''}
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

function selectedInputData() {
    let data = []
    data = csvData.filter(x => {
        for (let key of Object.keys(x)) {
            if (key === 'Id') continue
            if (x[key] !== null && x[key] != "")
                return true
        }
        return false
    });

    return data;
}
//////////////////////////////////////////////////////////////////////////////////////////
// Fetching data from the API
async function FetchDataFromAPI() {
    await displaySources();
    let myModal = new bootstrap.Modal(document.getElementById('modalSources'));
    myModal.show();
}

async function ApplySelectedOutputSources() {
    console.log(selectedOutputSources)

    await runAPI()
}

async function runAPI() {
    filtereCSVdData = selectedInputData()
    if (filtereCSVdData.length === 0)
        return;

    let myModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    myModal.show()
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
        for (let key of selectedColumns) {
            try {
                updateDetails(key, d[key], '', 'before')
                if (d[key] !== undefined && d[key] !== '') {
                    //console.log(d['Id'] + ' GAP ' + getNumber(d[key]))
                    let source = await getURLParameter(key)  //d[key])
                    let prefix = getPrefix(source) === null ? '' : getPrefix(source);
                    let Id = prefix + d[key]
                    let jsonData = await getRelations(Id, source);

                    d.processed = true;
                    createDownloadCSV(jsonData, source, d, key)
                }
            } catch (ex) {
                updateDetails(null, null, null, ex.message)
            }
        }
        updateStats()
        //if (found === 100) {
        //    updateDetails(null, null, null, null, 'Process completed...')
        //    break;
        //}
    }

    if (filtereCSVdData.length === loopIndex)
        updateDetails(null, null, null, 'Process completed...')
}

function createDownloadCSV(jsonData, source, d, key) {
    let filteredData = jsonData;

    let object = {}

    for (let col of selectedColumns) {
        if (d['Id'] !== '' && d['Id'] !== undefined)
            object['Id'] = d['Id']
        else if (d['id'] !== '' && d['id'] !== undefined)
            object['Id'] = d['id']

        object[col] = d[col];
    }

    for (let src of selectedOutputSources) {
        if (Array.isArray(jsonData)) {
            if (filteredData.filter(x => x.TM_ID)[0]['TM_ID'].length > 0) {
                let ids = ''
                let value = filteredData.filter(x => x.TM_ID)[0];
                for (let v of value['TM_ID']) {
                    ids += `${v}, `;
                }
                ids = ids.trim().slice(0, -1);
                object['TM_ID'] = ids;//filteredData.filter(x => x.TM_ID)[0]['TM_ID'][0];
            }

            if (filteredData.filter(x => x[src]).length > 0) {
                let ids = ''
                let value = filteredData.filter(x => x[src])[0];
                for (let v of value[src]) {
                    ids += `${v}, `;
                }
                ids = ids.trim().slice(0, -1);
                object[src] = ids; //[src][0]; //.match(/\d/g).join("")
                //found++
            }
            else {
                object[src] = '';
            }

            updateDetails(key, d[key], object, 'after')
        }
        else {
            object[src] = '';
        }
    }
    dwonloadFile.push(object)
}

function updateDetails(source, sourceId, obj, status) {
    if (status === 'before')
        document.getElementById('divDetail').innerHTML += `<p>Fetching Ids using ${source}: ${sourceId === '' ? 'N/A' : sourceId}</p>`
    else if (status === 'after')
        document.getElementById('divDetail').innerHTML += `<p>Fetched ${Object.keys(obj)[0]}: ${Object.values(obj)[0]} using ${source}: ${sourceId}</p>`
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
    $('.headerCheckbox').prop('disabled', false)
    document.getElementById('divDetail').innerHTML = '';
    $("#divDetail").hide()
    csvData = JSON.parse(jsonRecords);
    (async () => {
        await displaySources();
    })();
    selectedOutputSources = [];
    $('#txtSearch').val('');
    $('#btnApplySelectedSources').hide()
}

async function displaySources() {
    let checkLists = '';
    //console.log(await getAllDataSources())
    sources = all_datasources;//await getAllDataSources()
    //sources = sources.filter(x => x.json_key !== 'TM_ID');
    for (let src of sources) {
        //if (!selectedColumns.includes(src.json_key)) {
        checkLists += `<label class="list-group-item">
                <input class="form-check-input me-1 chkDatasources" type="checkbox" onclick="SelectSource(this)" key="${src.json_key}" val="${src.json_key}">
                ${src.home_page}
                </label>`;
        // }
        // else {
        //     sources = sources.filter(x => x.json_key !== src.json_key);
        // }
    }
    document.getElementById('divSources').innerHTML = checkLists;
}

function search(control) {
    let checkLists = '';
    let filteredSources = []
    if (control.value !== '') {
        let input = control.value.toLowerCase();
        filteredSources = sources.filter(x => x.home_page.toLowerCase().includes(input) ||
            x.url_parameter.toLowerCase().includes(input) || x.json_key.toLowerCase().includes(input))
    }
    else {
        filteredSources = sources;
    }

    for (let src of filteredSources) {
        if (selectedOutputSources.filter(x => x === src.json_key).length > 0) {
            checkLists += `<label class="list-group-item active">
                <input class="form-check-input me-1 chkDatasources" checked="checked" type="checkbox" onclick="SelectSource(this)" key="${src.json_key}" val="${src.json_key}">
                    ${src.home_page}
                </label>`;
        }
        else {
            checkLists += `<label class="list-group-item">
            <input class="form-check-input me-1 chkDatasources" type="checkbox" onclick="SelectSource(this)" key="${src.json_key}" val="${src.json_key}">
                ${src.home_page}
            </label>`;
        }
    }

    document.getElementById('divSources').innerHTML = checkLists;
}

function SelectSource(control) {
    if (control.checked) {
        selectedOutputSources.push(control.getAttribute('key'))
        control.parentNode.classList.add('active')
    }
    else {
        selectedOutputSources = selectedOutputSources.filter(x => x !== control.getAttribute('key'))
        control.parentNode.classList.remove('active')
    }

    if (selectedOutputSources.length > 0) {
        $('#btnApplySelectedSources').show()
    }
    else {
        $('#btnApplySelectedSources').hide()
    }
}

function select_unselect_all(isSelectedAll) {
    if (isSelectedAll) {
        $('.chkDatasources').parent().addClass('active')
        Array.from($('.chkDatasources')).forEach(checkbox => {
            checkbox.checked = true;
            selectedOutputSources.push(checkbox.getAttribute('key'))
        })
        $('#btnApplySelectedSources').show()
    }
    else {
        $('.chkDatasources').parent().removeClass('active')
        Array.from($('.chkDatasources')).forEach(checkbox => {
            checkbox.checked = false;
            selectedOutputSources = []
        })
        $('#btnApplySelectedSources').hide()
    }
}

async function action(control, event) {
    if (control.classList.contains('enabled')) {
        if (event === 'play') {
            play = true;
            disabledAllActionButtons()
            enableActionButton('pause')
            updateDetails(null, null, null, null, 'Process started again...')
            //FetchDataFromAPI(null)
            await runAPI()
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
            // Create a temporary object to track unique keys
            const uniqueKeys = {};
            const uniqueData = dwonloadFile.filter((item) => {
                // Generate a unique key based on the properties you want to compare

                const dynamicKeys = Object.keys(item);
                const key = dynamicKeys.map((k) => item[k]).join("_");

                // Check if the key is already in the temporary object
                if (!uniqueKeys[key]) {
                    // If it's not in the object, mark it as seen by adding it to the object
                    uniqueKeys[key] = true;
                    return true; // Include the item in the result
                }
                return false; // Exclude the item from the result (duplicate)
            });
            let csv = convertJSON2CSV(uniqueData)
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
            control.children[1].innerHTML = 'Hide Details'
        } else {
            $("#divDetail").hide()
            control.children[1].innerHTML = 'Show Details'

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
