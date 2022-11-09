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
var selectedOutputSources = [];
var sources = [];


(async () => {
    await displaySources();
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
    let checkboxes = $('.headerCheckbox')

    if (control.checked) {
        if (control.value.toLowerCase() === "trismegistos" || control.value.toLowerCase() === "tm_id") {
            Array.from(checkboxes).forEach(chk => {
                if (chk.value.toLowerCase() !== "trismegistos" && chk.value.toLowerCase() !== "tm_id")
                    chk.disabled = true
            })
        }
        else {
            $(`input[value = "Trismegistos"]`).prop('disabled', true)
            $(`input[value = "TM_ID"]`).prop('disabled', true)
            $(`input[value = "Trismegistos"]`).checked = false
            $(`input[value = "TM_ID"]`).checked = false
        }
        selectedColumns.push(control.value)
    }
    else {
        selectedColumns.splice(selectedColumns.findIndex(x => x === control.value), 1)
        if (selectedColumns.length === 0) {
            checkboxes.prop('disabled', false);
        }
    }

    selectedColumns.length === 0 ? $('#btnFetchData').hide() : $('#btnFetchData').show()
}

function selectedInputData() {
    let checkboxes = $('.headerCheckbox')
    let data = []
    Array.from(checkboxes).forEach(chk => {
        if (chk.checked && (chk.value.toLowerCase() === "trismegistos" || chk.value.toLowerCase() === "tm_id")) {
            let key = Object.keys(csvData[0]).includes('Trismegistos') ? 'Trismegistos' : 'TM_ID'
            data = csvData.filter(x => x[key] !== '')
            return;
        }
    })

    if (data.length === 0) {
        let rec = csvData.filter(x => {
            for (let key of Object.keys(x)) {
                if (key === 'Id') continue
                if (x[key] !== null && x[key] != "")
                    return true
            }
            return false
        });

        data = rec.filter(x => x.Trismegistos === '' || x.TM_ID === '')
    }

    return data;
}
//////////////////////////////////////////////////////////////////////////////////////////
// Fetching data from the API
async function FetchDataFromAPI() {
    let isTM = false;
    Array.from($('.headerCheckbox')).forEach(chk => {
        if (chk.checked && (chk.value.toLowerCase() === "trismegistos" || chk.value.toLowerCase() === "tm_id")) {
            isTM = true
            return;
        }
    })
    if (isTM) {
        let myModal = new bootstrap.Modal(document.getElementById('modalSources'));
        myModal.show()
    }
    else {
        let myModal = new bootstrap.Modal(document.getElementById('loadingModal'));
        myModal.show()
        await runAPI()
    }
}

async function ApplySelectedOutputSources() {
    console.log(selectedOutputSources)
    let myModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    myModal.show()
    await runAPI()
}

async function runAPI() {
    filtereCSVdData = selectedInputData()
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
            try {
                if (selectedColumns.filter(x => x === key).length > 0) {
                    updateDetails(d['Id'], key, d[key], '', 'before')
                    if (d[key] !== undefined && d[key] !== '') {
                        //console.log(d['Id'] + ' GAP ' + getNumber(d[key]))
                        let source = await getURLParameter(key)  //d[key])
                        let Id = getPrefix(source) + d[key]
                        let jsonData = await getRelations(Id, source);

                        d.processed = true;
                        createDownloadCSV(jsonData, source, d, key)
                        found++
                        break;
                    }
                }
            } catch (ex) {
                updateDetails(null, null, null, null, ex.message)
            }
        }
        updateStats()
        //if (found === 100) {
        //    updateDetails(null, null, null, null, 'Process completed...')
        //    break;
        //}
    }

    if (filtereCSVdData.length === loopIndex)
        updateDetails(null, null, null, null, 'Process completed...')
}

function createDownloadCSV(jsonData, source, d, key) {
    if (source !== null) {
        let Obj_TM_ID = jsonData[0]
        let TM_ID = Obj_TM_ID === undefined || Obj_TM_ID === null ? '' : Object.values(Obj_TM_ID)[0][0]
        let object = {}
        object['Id'] = d['Id']
        object['TM_ID'] = TM_ID
        for (let col of selectedColumns) {
            object[col] = '';
        }
        object[key] = d[key]
        dwonloadFile.push(object)
        updateDetails(d['Id'], key, d[key], { TM_ID: TM_ID }, 'after')
    }
    else {
        let filteredData = jsonData.filter((row) => {
            var ignoreValue = Object.values(row).some(elem => elem === null);
            return !ignoreValue ? true : false;
        });

        let object = {}

        for (let src of selectedOutputSources) {
            object['Id'] = d['Id']
            object['TM_ID'] = filteredData.filter(x => x.TM_ID)[0]['TM_ID'][0]

            if (filteredData.filter(x => x[src]).length > 0) {
                object[src] = filteredData.filter(x => x[src])[0][src][0]; //.match(/\d/g).join("")
            }
            else {
                object[src] = '';
            }
        }
        dwonloadFile.push(object)
    }
}

//function getPrefix(Id, source) {
//    if (source.toLowerCase() === 'edr') {
//        return `EDR${Id}`
//    }
//    return Id;
//}

function updateDetails(Id, source, sourceId, obj, status) {
    if (status === 'before')
        document.getElementById('divDetail').innerHTML += `<p>Fetching Ids for ${Id} using ${source}: ${sourceId === '' ? 'N/A' : sourceId}</p>`
    else if (status === 'after')
        document.getElementById('divDetail').innerHTML += `<p>Fetched ${Object.keys(obj)[0]}: ${Object.values(obj)[0]} for ${Id} using ${source}: ${sourceId}</p>`
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
    sources = await getAllDataSources()
    for (let src of sources) {
        checkLists += `<label class="list-group-item">
                            <input class="form-check-input me-1 chkDatasources" type="checkbox" onclick="SelectSource(this)" key="${src.JSON_Key}" val="${src.JSON_Key}">
                            ${src.Homepage}
                        </label>`;
    }

    document.getElementById('divSources').innerHTML = checkLists;
}

function search(control) {
    let checkLists = '';
    let filteredSources = []
    if (control.value !== '') {
        let input = control.value.toLowerCase();
        filteredSources = sources.filter(x => x.Homepage.toLowerCase().includes(input) ||
            x.URL_parameter.toLowerCase().includes(input) || x.JSON_Key.toLowerCase().includes(input))
    }
    else {
        filteredSources = sources;
    }

    for (let src of filteredSources) {
        checkLists += `<label class="list-group-item">
                            <input class="form-check-input me-1 chkDatasources" type="checkbox" onclick="SelectSource(this)" key="${src.JSON_Key}" val="${src.JSON_Key}">
                            ${src.Homepage}
                        </label>`;
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
