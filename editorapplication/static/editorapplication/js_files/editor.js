
//Инициализация элементов страницы и добавление слушателей
content = document.getElementById("content")
mynetwork = document.getElementById("mynetwork")
mytable = document.getElementById("mytable")
editButton = document.getElementById("edit_node")
editButton.addEventListener('click', editNodeOnClick)
editButton.hidden = true
deleteButton = document.getElementById("delete_node")
deleteButton.addEventListener('click', deleteNodeOnClick)
deleteButton.hidden = true
addButton = document.getElementById("add_node")
addButton.addEventListener('click', addNodeOnClick)
addButton.hidden = true
tableButton = document.getElementById("show_table")
tableButton.addEventListener('click', tableDrawOnClick)
tableButton.hidden = true
graphButton = document.getElementById("show_graph")
graphButton.addEventListener('click', graphDrawOnClick)
graphButton.hidden = true
addSubjectButton = document.getElementById("add_subject")
addSubjectButton.addEventListener('click', addSubjectOnClick)
addSubjectButton.hidden = true
addIndicatorButton = document.getElementById("add_indicator")
addIndicatorButton.addEventListener('click', addIndicatorOnClick)
addIndicatorButton.hidden = true
helpButton = document.getElementById("show_help")
helpButton.addEventListener('click', showHelpOnClick)
showAllButton = document.getElementById("show_all")
showAllButton.addEventListener('click', showAllOnClicked)
hideAllButton = document.getElementById("hide_all")
hideAllButton.addEventListener('click', hideAllOnClicked)
hideAllButton.hidden = true
watchButton = document.getElementById("watch")
watchButton.addEventListener('click', byIdOnClicked)
watchButton.hidden = true
backButton = document.getElementById("back")
backButton.addEventListener('click', mainOnClicked)
backButton.hidden = true

//Объявление глобальных переменных
const host = '127.0.0.1'
var parsedNodes = [], parsedRelationShips = []
var chosenNode, nodeData, chosenNode_Type
var grida
var mode, part, graphId
var indicatorList = [], opkList = [], helpData = []

//Окно для отображения инструкции пользования приложением
var showHelp = {
    view:"form",
    id:"help",

    elements: [
        {
            view: "tree",
            id:"tree_help",
            template: "{common.space()}{common.icon()} #value#",
            data: helpData,
        }
    ]
}

webix.ui({
    view:"window", move:true,
    position: "center",
    id:"win_help",
    width:500,
    height:300,
    head:{
        view:"toolbar", margin:-4, cols:[
            {view:"label", label: "Help" },
            { view:"button", label:"close", width: 60, click: function(){
                $$('help').hide();
            }}
        ]
    },
    body:webix.copy(showHelp)
});

//Форма для создания новой компетенции
var form_create_opk = {
    view: "form",
    id: "createOPK",
    borderless:true,
    elements: [
        {view: "label", label: "Новая компетенция"},
        {view:"text", id:"opkText", label:'Введите компетенцию ', name:"new_label", labelPosition: "top"},
        { view:"button", value: "OK", align: "right", click:async function () {

                let nodeType = "OPK"
                let values = $$("createOPK").getValues();
                if (values["new_label"] != null && values["new_label"] !== '') {
                    let response = await addData('http://' + host.toString() + ':8000/get_data', {
                        id: null, new_label: values["new_label"], type: nodeType
                    })

                    if (response.status !== 201) {
                        alert(await response.text() + ' ' + response.status.toString())
                        return
                    }

                    let body = await response.json()
                    let newNode = body["tree"]

                    parsedNodes.push(newNode)

                    opkList = getOPKList(parsedNodes)
                    $$("opkCombo").define("options",opkList);
                    $$("opkCombo").refresh();
                    $$('win_create_opk').hide();
                }
                else{
                    alert("Empty!")
                    $$('win_create_opk').hide();
                }
            }
        },
        { view:"button", value: "Close", align: "right", click:function (){
                $$('win_create_opk').hide();
            }
        }
    ]
}

webix.ui({
    view:"popup",
    position: "center",
    id:"win_create_opk",
    width:300,
    head:false,
    body:webix.copy(form_create_opk)
});

//Форма для создания нового индикатора
var form_create_indicator = {
    view: "form",
    id: "createIndicator",
    borderless:true,
    elements: [
        {view: "label", label: "Новый индикатор"},
        {view:"text", id:"indicatorText", label:'Введите индикатор ', name:"new_label", labelPosition: "top"},
        {view:"combo", id:"opkCombo", label:"Выберите компетенцию", labelPosition:"top",
            options:opkList,
        },
        { view:"button", value: "OK", align: "right", click:async function () {
                //$$('win_create_indicator').hide();
                let selectedId = $$("opkCombo").getValue();
                if (selectedId != null && selectedId !== '') {
                    //chosenNode = selectedId
                } else {
                    alert("Не выбрана компетенция!")
                    $$('win_create_indicator').hide();
                }
                let nodeType = "Indicator"
                let values = $$("createIndicator").getValues();
                if (values["new_label"] != null && values["new_label"] !== '') {
                    let response = await addData('http://' + host.toString() + ':8000/get_data', {
                        id: selectedId, new_label: values["new_label"], type: nodeType
                    })

                    if (response.status !== 201) {
                        alert(await response.text() + ' ' + response.status.toString())
                        return
                    }

                    let body = await response.json()
                    let newNode = body["tree"]

                    parsedNodes.push(newNode)

                    let newRelationShip = body["relationShips"]
                    if (typeof (newRelationShip) != "undefined") {
                        parsedRelationShips.push(newRelationShip)
                        console.log(parsedRelationShips)
                    }
                    indicatorList = getIndicatorList(parsedNodes)
                    $$("indicatorCombo").define("options",indicatorList);
                    $$("indicatorCombo").refresh();
                    $$('win_create_indicator').hide();
                }
                else{
                    alert("Empty!")
                    $$('win_create_indicator').hide();
                }
            }
        },
        { view:"button", value: "Новая компетенция", align: "right", click:function (){
                showForm("win_create_opk")
            }
        },
        { view:"button", value: "Close", align: "right", click:function (){
                $$('win_create_indicator').hide();
            }
        }
    ]
}

webix.ui({
    view:"popup",
    position: "center",
    id:"win_create_indicator",
    width:300,
    head:false,
    body:webix.copy(form_create_indicator)
});

//Форма для добавления индикатора к дисциплине
var form_indicator_add = {
    view:"form",
    id: "indicatorForm",
    borderless: true,
    elements: [
        {view: "label", label: "Добавить индикатор"},
        {view:"combo", id:"indicatorCombo", label:"Выберите индикатор", labelPosition:"top",
            options:indicatorList,
        },
            { view:"button", value: "OK", align: "left", click:async function () {
                let selectedId = $$("indicatorCombo").getValue();
                if (selectedId != null && selectedId !== ''){
                    let  nodeType = "indicatorToSubject"
                    let response = await addData('http://' + host.toString() + ':8000/get_data', {
                        id: chosenNode, new_label: selectedId, type: nodeType
                    })
                    $$('win_indicator_add').hide();
                    if (response.status !== 201) {
                        alert(await response.text() + ' ' + response.status.toString())
                        return
                    }

                    let body = await response.json()

                    let newRelationShip = body["relationShips"]
                    console.log(parsedRelationShips)
                    console.log("new", newRelationShip)
                    if (typeof (newRelationShip) != "undefined") {
                        parsedRelationShips.push(newRelationShip)
                        console.log(parsedRelationShips)
                    }
                    chooseMode()
                }
                else{
                    alert("Empty!")
                    $$('win_indicator_add').hide();
                }}},

                { view:"button", value: "Новый индикатор", align: "right", click:function (){
                    opkList = getOPKList(parsedNodes)
                    $$("opkCombo").define("options",opkList);
                    $$("opkCombo").refresh();
                    showForm("win_create_indicator")
            }},

            { view:"button", value: "Close", align: "right", click:function (){
                $$('win_indicator_add').hide();
            }
        },
    ],
}

webix.ui({
    view:"window",
    position: "center",
    id:"win_indicator_add",
    width:300,
    height:400,
    head:false,
    body:webix.copy(form_indicator_add)
});

//Форма для создания нового узла дерева
var form_add = {
    view:"form",
    id: "addForm",
    borderless:true,
    elements: [
        { view: "label", id:"form_add_label1", label: "Добавить новый элемент"},
        { view:"text", id:"form_add_label2", label:'Введите название элемента ', name:"new_label"},
        {margin:5, cols:[
            { view:"button", value: "OK", align: "left", click:async function () {
                let values = $$("addForm").getValues();
                if (values["new_label"] != null && values["new_label"] !== ''){
                        //if (this.getParentView().validate()) { //validate form
                            //this.getTopParentView().close(); //hide window
                    //var values = $$("addForm").getValues();
                    let nodeType
                    switch (chosenNode_Type) {
                        case "OPK":
                            nodeType = "Indicator"
                            break
                        case "Indicator":
                            nodeType = "Descriptor"
                            break
                        default:
                            nodeType = "OPK"
                            break
                    }


                    let response = await addData('http://' + host.toString() + ':8000/get_data', {
                        id: chosenNode, new_label: values["new_label"], type: nodeType
                    })
                    $$('win_add').hide();
                    if (response.status !== 201) {
                        alert(await response.text() + ' ' + response.status.toString())

                        return
                    }

                    let body = await response.json()
                    let newNode = body["tree"]

                    parsedNodes.push(newNode)

                    let newRelationShip = body["relationShips"]
                    if (typeof (newRelationShip) != "undefined") {
                        parsedRelationShips.push(newRelationShip)
                        console.log(parsedRelationShips)
                    }

                    chooseMode()
                }
                else{
                    alert("Empty!")
                    $$('win_add').hide();
                }}},
            { view:"button", value: "Close", align: "right", click:function (){
                $$('win_add').hide();
            }}]
        },
    ],
    rules:{
        "new_label":webix.rules.isNotEmpty
    },
    elementsConfig:{
        labelPosition:"top",
    }
};

webix.ui({
    view:"popup",
    position: "center",
    id:"win_add",
    width:300,
    head:false,
    body:webix.copy(form_add)
});

//Форма для создания новой дисциплины
var form_subject_add = {
    view:"form",
    id: "addSubjectForm",
    borderless:true,
    elements: [
        { view: "label", label: "Добавить новую дисциплину"},
        { view:"text", label:'Введите название дисциплины ', name:"new_label"},
        //{ view:"text", label:'Email', name:"email" },
        {margin:5, cols:[
            { view:"button", value: "OK", align: "left", click:async function () {
                let values = $$("addSubjectForm").getValues();
                if (values["new_label"] != null && values["new_label"] !== ''){

                    let nodeType = "Subject"

                    let response = await addData('http://' + host.toString() + ':8000/get_data', {
                        id: "", new_label: values["new_label"], type: nodeType
                    })
                    $$('win_subject_add').hide();
                    if (response.status !== 201) {
                        alert(await response.text() + ' ' + response.status.toString())
                        return
                    }

                    let body = await response.json()
                    let newNode = body["tree"]

                    parsedNodes.push(newNode)

                    let newRelationShip = body["relationShips"]
                    if (typeof (newRelationShip) != "undefined") {
                        parsedRelationShips.push(newRelationShip)
                        console.log(parsedRelationShips)
                    }

                    chooseMode()
                }
                else{
                    alert("Empty!")
                    $$('win_subject_add').hide();
                }}},
            { view:"button", value: "Close", align: "right", click:function (){
                $$('win_subject_add').hide();
            }}]
        },
    ],
    rules:{
        "new_label":webix.rules.isNotEmpty
    },
    elementsConfig:{
        labelPosition:"top",
    }
};

webix.ui({
    view:"popup",
    position: "center",
    id:"win_subject_add",
    width:300,
    head:false,
    body:webix.copy(form_subject_add)
});

//Форма для редактирования узла дерева
var form_edit = {
    view:"form",
    id: "editForm",
    borderless:true,
    elements: [
        { view: "label", id:"form_edit_label1", label: "Редактировать узел дерева"},
        { view:"text", id:"form_edit_label2", label:'Введите имя узла дерева', name:"new_label"},
        //{ view:"text", label:'Email', name:"email" },
        {margin:5, cols:[
            { view:"button", value: "OK", align: "left", click:async function () {
                let values = $$("editForm").getValues();
                if (values["new_label"] != null && values["new_label"] !== '') {
                    let response = await editData('http://' + host.toString() + ':8000/get_data', {
                        id: chosenNode, new_label: values["new_label"], type: chosenNode_Type
                    })
                    if (response.status !== 200) {
                        alert(await response.text() + ' ' + response.status.toString())

                        return
                    }
                $$('win_edit').hide();
                    let body = await response.json()
                    //console.log(body.text)
                    let editedNode = body["tree"]

                    //console.log(editedNode)
                    for (let entry of parsedNodes) {
                        if (editedNode["id"] === entry["id"]) {
                            entry["label"] = values["new_label"]
                        }
                    }
                    chooseMode()
                }
                else{
                    alert("Empty!")
                    $$('win_edit').hide();
                }}},
            { view:"button", value: "Close", align: "right", click:function (){
                $$('win_edit').hide();
            }}]
        },
    ],
    rules:{
        "new_label":webix.rules.isNotEmpty
    },
    elementsConfig:{
        labelPosition:"top",
    }
};

webix.ui({
    view:"popup",
    position: "center",
    id:"win_edit",
    width:300,
    head:false,
    body:webix.copy(form_edit)
});

//Функция для отображения нужного окна
function showForm(winId, node){
    $$(winId).getBody().clear();
    $$(winId).show(node);
    $$(winId).getBody().focus();
}

//Обработка нажатия кнопки "Помощь"
function showHelpOnClick(){
    showForm("win_help")
}

//Запрос на редактирование данных
async function editData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response; // parses JSON response into native JavaScript objects
}

//Обработка нажатия кнопки "Редактировать"
async function editNodeOnClick() {
    showForm("win_edit")
}

//Запрос на удаление данных
async function deleteData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response; // parses JSON response into native JavaScript objects
}

//Обработка нажатия кнопки "Удалить"
async function deleteNodeOnClick(){
    let response = await deleteData('http://' + host.toString() + ':8000/get_data', {
        id: chosenNode, type: chosenNode_Type
    })
    if (response.status !== 200) {
        alert(await response.text() + ' ' + response.status.toString())
        return
    }

    let body = await response.json()
    console.log("chosen node", chosenNode)
    console.log(body["deleted"].text)
    if(body["deleted"] === "deleted"){
        console.log("id", chosenNode)
        for (i in parsedRelationShips){
            console.log("i", i)
            if(chosenNode === parsedRelationShips[i]["from"]){
                parsedRelationShips.splice(i, 1)
                console.log("deleted", i)
            }
        }
        console.log("relations", parsedRelationShips)
        for (i in parsedNodes) {
            console.log("i", i)
            if (chosenNode === parsedNodes[i]["id"]) {
                parsedNodes.splice(i, 1)
                console.log("deleted", i)
            }
        }
        console.log("nodes", parsedNodes)
    }
    chooseMode()
}

//Запрос на добавление данных
async function addData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response; // parses JSON response into native JavaScript objects
}

//Обработка нажатия кнопки "Добавить"
async function addNodeOnClick(){
    showForm("win_add")
}

//Обработка нажатия кнопки "Дисциплина"
async function addSubjectOnClick(){
    showForm("win_subject_add")
}

//Обработка нажатия кнопки "Индикатор"
async function addIndicatorOnClick(){
    indicatorList = getIndicatorList(parsedNodes)
    console.log(indicatorList)
    $$("indicatorCombo").define("options",indicatorList);
    $$("indicatorCombo").refresh();
    showForm("win_indicator_add")
}

//Функция для определения активных кнопок
function nodesClick(){
    console.log(part, chosenNode_Type)
    if(part === "ById") {
        switch (chosenNode_Type) {
            case "OPK":
                editButton.disabled = false
                addButton.disabled = false
                deleteButton.disabled = true
                editButton.setAttribute('title', "Редактировать компетенцию")
                addButton.setAttribute('title', "Добавить индикатор")
                deleteButton.removeAttribute('title')
                break
            case "Indicator":
                editButton.disabled = false
                addButton.disabled = false
                deleteButton.disabled = false
                editButton.setAttribute('title', "Редактировать индикатор")
                addButton.setAttribute('title', "Добавить дескриптор")
                deleteButton.setAttribute('title', "Удалить индикатор")
                break
            case "Descriptor":
                editButton.disabled = false
                addButton.disabled = true
                deleteButton.disabled = false
                editButton.setAttribute('title', "Редактировать дескриптор")
                deleteButton.setAttribute('title', "Удалить дескритор")
                addButton.removeAttribute('title')
                break
            default:
                editButton.disabled = true
                addButton.disabled = true
                deleteButton.disabled = true
                editButton.removeAttribute('title')
                addButton.removeAttribute('title')
                deleteButton.removeAttribute('title')
                break
        }
    }
    if(part === "Main"){
        console.log("here")
        switch (chosenNode_Type){
            case "Indicator":
                console.log("here")
                addSubjectButton.disabled = false
                addIndicatorButton.disabled = true
                editButton.disabled = false
                deleteButton.disabled = false
                watchButton.disabled = false
                addSubjectButton.setAttribute('title', "Создать новую дисциплину")
                addIndicatorButton.removeAttribute('title')
                editButton.setAttribute('title', "Редактировать индикатор")
                deleteButton.setAttribute('title', "Удалить индикатор")
                break
            case "Subject":
                addSubjectButton.disabled = false
                addIndicatorButton.disabled = false
                editButton.disabled = false
                deleteButton.disabled = false
                watchButton.disabled = true
                addSubjectButton.setAttribute('title', "Создать новую дисциплину")
                addIndicatorButton.setAttribute('title', "Добавить индикатор")
                editButton.setAttribute('title', "Редактировать индикатор")
                deleteButton.setAttribute('title', "Удалить индикатор")
                break
            default:
                addSubjectButton.disabled = false
                addIndicatorButton.disabled = true
                editButton.disabled = true
                deleteButton.disabled = true
                addSubjectButton.removeAttribute('title')
                addIndicatorButton.removeAttribute('title')
                editButton.removeAttribute('title')
                deleteButton.removeAttribute('title')
                break
        }
    }
}

//Функция режима работы
function chooseMode(){
    switch (mode){
        case "Table":
            tableDrawOnClick()
            break
        case "Graph":
            graphDrawOnClick()
            break
        default:
            tableDrawOnClick()
    }
}

function showAllOnClicked(){
    addButton.hidden = true
    deleteButton.hidden = true
    editButton.hidden = true
    addIndicatorButton.hidden = true
    addSubjectButton.hidden = true
    tableButton.hidden = true
    graphButton.hidden = true
    watchButton.hidden = true
    backButton.hidden = true
    showAllButton.hidden = true
    hideAllButton.hidden = false

    content.style.display = 'none'
    mytable.style.display = 'none'
    mynetwork.style.display = 'block'

    nodes = new vis.DataSet(parsedNodes);
    edges = new vis.DataSet(parsedRelationShips);

    let data = {
        nodes: nodes,
        edges: edges,
    };

    options = {
        edges: {
            smooth: {
                type: "cubicBezier",
                roundness: 0.4,
            },
        },
        nodes: {
            shape: "box",
            margin: 10,
            widthConstraint: {
                maximum: 200,
            },
            borderWidth: 1,
            shadow: true,
            font: {
                face: "raleway",
                size: 12,
                color: "#000051",
                align: "center",
            },
        },
        layout: {
            hierarchical: {
                direction: "UD",
            },
        },
        physics: {
            enabled: true,
            hierarchicalRepulsion: {
                centralGravity: 0.01,
                springLength: 100,
                springConstant: 0.0,
                nodeDistance: 200,
                damping: 0.5
            },
            solver: 'hierarchicalRepulsion',
        },
        interaction: {
            navigationButtons: true,
            keyboard: true,
        },
    }

    network = new vis.Network(mynetwork, data, options);
}

function hideAllOnClicked(){
    hideAllButton.hidden = true
    showAllButton.hidden = false

    chooseMode()
}

//Обработка нажатия кнопки "Перейти"
function byIdOnClicked(){
    graphId = chosenNode
    part = "ById"
    graphDrawOnClick()
}

//Обработка нажатия кнопки "Назад"
function mainOnClicked(){
    graphId = ""
    part = "Main"
    tableDrawOnClick()
}

//Обработка нажатия кнопки "Таблица"
function tableDrawOnClick(){
    content.style.display = 'none'
    mynetwork.style.display = 'none'
    mytable.style.display = 'block'
    tableButton.hidden = true
    graphButton.hidden = false

    mode = "Table"

    switch (part) {
        case "Main":
            addButton.hidden = true
            addSubjectButton.hidden = false
            addIndicatorButton.hidden = false
            deleteButton.hidden = false
            editButton.hidden = false
            watchButton.hidden = false
            backButton.hidden = true
            nodesClick()
            mainTableDraw()
            break
        case "ById":
            addButton.hidden = false
            addSubjectButton.hidden = true
            addIndicatorButton.hidden = true
            deleteButton.hidden = false
            editButton.hidden = false
            watchButton.hidden = true
            backButton.hidden = false
            nodesClick()
            tableDraw()
            break
        default:
            mainTableDraw()
    }
}

//Функция для отображения таблицы компетенции
function tableDraw() {
    let opk_id = getOPKId(parsedNodes, parsedRelationShips, graphId)
    if(opk_id !== "") {
        let table_data = tableData(parsedNodes, parsedRelationShips, opk_id["id"])

        webix.ready(function (message) {
            if (grida) {
                grida.destructor()
            }
            grida = webix.ui({
                container: "mytable",
                id: "table",
                view: "treetable",
                columns: [
                    //{ id:"id",	header:"", css:{"text-align":"right"},  	width:50},
                    {
                        id: "label", header: "Label", width: 350,
                        template: "{common.space()}{common.icon()} #label#",
                        fillspace: 1
                    },
                    {id: "node_type", header: "Type", width: 250}
                ],
                select: "row",
                //autoheight: true,
                autowidth: true,


                on: {
                    onSelectChange: function () {
                        //console.log()
                        chosenNode = $$("table").getSelectedId(true).join();
                        var record = $$("table").getItem(chosenNode)

                        chosenNode_Type = record.node_type
                        nodesClick()
                    }
                },
                data: table_data
            });
        });
    }
    else{
        mainOnClicked()
    }
}

//Обработка нажатия кнопки "Граф"
function graphDrawOnClick(){
    content.style.display = 'none'
    mytable.style.display = 'none'
    mynetwork.style.display = 'block'
    tableButton.hidden = false
    graphButton.hidden = true

    mode = "Graph"
    switch (part) {
        case "Main":
            addButton.hidden = true
            addSubjectButton.hidden = false
            addIndicatorButton.hidden = false
            deleteButton.hidden = false
            editButton.hidden = false
            watchButton.hidden = false
            backButton.hidden = true
            nodesClick()
            mainGraphDraw()
            break
        case "ById":
            addButton.hidden = false
            addSubjectButton.hidden = true
            addIndicatorButton.hidden = true
            deleteButton.hidden = false
            editButton.hidden = false
            watchButton.hidden = true
            backButton.hidden = false
            nodesClick()
            graphDraw()
            break
        default:
            mainGraphDraw()
    }
}

//Функция для отображения графа компетенции
function graphDraw() {
    let opk_id = getOPKId(parsedNodes, parsedRelationShips, graphId)
    if(opk_id !== "") {
        graph_data = graphData(parsedNodes, parsedRelationShips, opk_id["id"])

        nodes = new vis.DataSet(graph_data["nodes"]);
        edges = new vis.DataSet(graph_data["edges"]);

        let data = {
            nodes: nodes,
            edges: edges,
        };

        options = {
            edges: {
                smooth: {
                    type: "cubicBezier",
                    roundness: 0.4,
                },
            },
            nodes: {
                shape: "box",
                margin: 10,
                widthConstraint: {
                    maximum: 200,
                },
                borderWidth: 1,
                shadow: true,
                font: {
                    face: "raleway",
                    size: 12,
                    color: "#000051",
                    align: "center",
                },
            },
            layout: {
                hierarchical: {
                    direction: "UD",
                },
            },
            physics: {
                enabled: true,
                hierarchicalRepulsion: {
                    centralGravity: 0.01,
                    springLength: 100,
                    springConstant: 0.0,
                    nodeDistance: 200,
                    damping: 0.5
                },
                solver: 'hierarchicalRepulsion',
            },
            interaction: {
                navigationButtons: true,
                keyboard: true,
            },
        }

        network = new vis.Network(mynetwork, data, options);

        chosenNode = ''

        network.on("click", function (params) {
            params.event = "[original event]";
            about = JSON.stringify(
                params,
                null,
                4
            );

            chosenNode = params.nodes[0]
            nodeData = nodes.get(chosenNode)
            chosenNode_Type = nodeData["node_type"]

            if (params.nodes.length !== 0) {
                nodesClick()
            } else {
                chosenNode_Type = ""
                nodesClick()
            }
        })
    }
    else{
        mainOnClicked()
    }
}

//Функция для отображения графа дисциплин
function mainTableDraw(){
    //mode = "Table"
    //addButton.disabled = true
    deleteButton.disabled = true
    editButton.disabled = true

    let table_data = mainTableData(parsedNodes, parsedRelationShips)

    console.log("table", table_data)

    webix.ready(function (message) {
        if (grida){
            grida.destructor()
        }
        grida = webix.ui({
            container: "mytable",
            id: "table",
            view: "treetable",
            columns: [
                {
                    id: "label", header: "Label", width: 350,
                    template: "{common.space()}{common.icon()} #label#",
                    fillspace:1
                },
                {id: "node_type", header: "Type", width: 250}
            ],
            select: "row",
            autoheight: false,
            autowidth: true,

            on: {
                onSelectChange: function () {
                    //console.log()
                    chosen_id = $$("table").getSelectedId(true).join();
                    var record = $$("table").getItem(chosen_id)
                    chosenNode = record.node_id
                    chosenNode_Type = record.node_type
                    console.log(chosenNode, chosenNode_Type)
                    nodesClick()
                }
            },
            data: table_data
        });
    });
}

//Функция для отображения графа дисциплин
function mainGraphDraw(){
    let graph_data = mainGraphData(parsedNodes, parsedRelationShips)
    console.log(graph_data)
    nodes = new vis.DataSet(graph_data["nodes"]);
    edges = new vis.DataSet(graph_data["edges"]);



    let data = {
        nodes: nodes,
        edges: edges,
    };

    options = {
        edges: {
            smooth: {
                type: "cubicBezier",
                roundness: 0.4,
            },
        },
        nodes: {
            shape: "box",
            margin: 10,
            widthConstraint: {
                maximum: 200,
            },
            borderWidth: 1,
            shadow: true,
            font: {
                face: "raleway",
                size: 12,
                color: "#000051",
                align: "center",
            },
        },
        layout: {
            hierarchical: {
                direction: "UD",
            },
        },
        physics: {
            enabled: true,
            hierarchicalRepulsion: {
                centralGravity: 0.01,
                springLength: 100,
                springConstant: 0.0,
                nodeDistance: 200,
                damping: 0.5
            },
            solver: 'hierarchicalRepulsion',
        },
        interaction: {
            navigationButtons: true,
            keyboard: true,
        },
    }

    network = new vis.Network(mynetwork, data, options);
    chosenNode = ''

    network.on("click", function (params) {
        params.event = "[original event]";
        about = JSON.stringify(
            params,
            null,
            4
        );

        chosenNode = params.nodes[0]
        nodeData = nodes.get(chosenNode)
        //chosenNode_label = nodeData["label"]
        chosenNode_Type = nodeData["node_type"]

        if (params.nodes.length !== 0) {
            nodesClick()
            /*editButton.disabled = false
            deleteButton.disabled = chosenNode_Type === "OPK";
            addButton.disabled = chosenNode_Type === "Descriptor";*/
        } else {
            /*addButton.disabled = true
            deleteButton.disabled = true
            editButton.disabled = true*/
            chosenNode_Type = ""
            nodesClick()
        }
    })
}

//Функция для загрузки веб-страницы
async function onPageLoaded() {
    mynetwork.style.display = 'none'
    mytable.style.display = 'none'
    //let content = document.getElementById("content")
    content.innerHTML = "Загрузка... <img src = \"https://smallenvelop.com/wp-content/uploads/2014/08/Preloader_8.gif\">" //https://smallenvelop.com/wp-content/uploads/2014/08/Preloader_11.gif

    try {
        let response = await fetch('http://' + host.toString() + ':8000/get_data')
        let body = await response.json()
        content.style.display = 'none'
        helpData = getHelpData()
        $$("tree_help").define("data",helpData);
        $$("tree_help").refresh();
        part = "Main"
        mode = "Table"

        if(typeof(body['tree']) != "undefined") {
            let tree = body['tree'].flat()
            parsedNodes = tree.map(function (e) {
                return {
                    "id": e['id'],
                    "label": e['label'],
                    "color": e['color'],
                    "level": e['level'],
                    "node_type": e['type']
                }
            })

            parsedRelationShips = body['relationShips'].flat().flat()

            graphButton.hidden = false

            tableDrawOnClick()
        }
        else{
            await addSubjectOnClick()
        }
    } catch
        (e) {
        content.innerHTML = "Error" + e
        }

}

//Загрузка веб-страницы
onPageLoaded()
