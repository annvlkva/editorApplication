content = document.getElementById("content")
mynetwork = document.getElementById("mynetwork")
mytable = document.getElementById("mytable")
editButton = document.getElementById("edit_node")
deleteButton = document.getElementById("delete_node")
addButton = document.getElementById("add_node")
tableButton = document.getElementById("show_table")
graphButton = document.getElementById("show_graph")

const host = '127.0.0.1'//'192.168.0.8'  '192.168.1.179'//

var parsedNodes = [], parsedRelationShips = []
var chosenNode, nodeData, chosenNode_Type
var grida
var mode

editButton.disabled = true
deleteButton.disabled = true
addButton.disabled = true
tableButton.disabled = true
graphButton.disabled = true

function addFormLabel(){
    switch (chosenNode_Type){
        case "OPK":
            return "  индиктор"
        case "Indicator":
            return "  дескриптор"
        default:
            return ""
    }
}

function editFormLabel(){
    switch (chosenNode_Type){
        case "OPK":
            return "  компетенцию"
        case "Indicator":
            return "  индикатор"
        case "Descriptor":
            return "  дескриптор"
        default:
            ""
    }
}

var form_add = {
    view:"form",
    id: "addForm",
    borderless:true,
    elements: [
        { view: "label", id:"form_add_label1", label: "Добавить"},
        { view:"text", id:"form_add_label2", label:'Введите label', name:"new_label"},
        //{ view:"text", label:'Email', name:"email" },
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

                    switch (mode) {
                        case "Table":
                            graphButton.removeEventListener('click', graphDrawOnClick)
                            tableDraw()
                            break;
                        case "Graph":
                            tableButton.removeEventListener('click', tableDrawOnClick)
                            graphDraw()
                            break
                        default:
                            content.innerHTML = "Error"
                            break
                    }
                }
                else{
                    addEventListeners()
                    alert("Empty!")
                    $$('win_add').hide();
                }}},
            { view:"button", value: "Close", align: "right", click:function (){
                addEventListeners()
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

var form_edit = {
    view:"form",
    id: "editForm",
    borderless:true,
    elements: [
        { view: "label", id:"form_edit_label1", label: "Редактировать"},
        { view:"text", id:"form_edit_label2", label:'Введите label', name:"new_label"},
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
                    switch (mode) {
                        case "Table":
                            graphButton.removeEventListener('click', graphDrawOnClick)
                            tableDraw()
                            break;
                        case "Graph":
                            tableButton.removeEventListener('click', tableDrawOnClick)
                            graphDraw()
                            break
                        default:
                            content.innerHTML = "Error"
                            break
                    }
                }
                else{
                    addEventListeners()
                    alert("Empty!")
                    $$('win_edit').hide();
                }}},
            { view:"button", value: "Close", align: "right", click:function (){
                addEventListeners()
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

function showForm(winId, node){
    $$(winId).getBody().clear();
    $$(winId).show(node);
    $$(winId).getBody().focus();
}

function addEventListeners() {
    editButton.addEventListener('click', editNodeOnClick)
    deleteButton.addEventListener('click', deleteNodeOnClick)
    addButton.addEventListener('click', addNodeOnClick)
}

function removeEventListeners() {
    editButton.removeEventListener('click', editNodeOnClick)
    deleteButton.removeEventListener('click', deleteNodeOnClick)
    addButton.removeEventListener('click', addNodeOnClick)
}

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

async function editNodeOnClick() {
    removeEventListeners()

    $$("form_edit_label1").define("label","Редактировать"+editFormLabel());
    $$("form_edit_label1").refresh();
    $$("form_edit_label2").define("label","Введите"+editFormLabel()+": ");
    $$("form_edit_label2").refresh();

    showForm("win_edit")
}

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

async function deleteNodeOnClick(){
    removeEventListeners()

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
    switch (mode) {
            case "Table":
                graphButton.removeEventListener('click', graphDrawOnClick)
                tableDraw()
                break;
            case "Graph":
                tableButton.removeEventListener('click', tableDrawOnClick)
                graphDraw()
                break
            default:
                content.innerHTML = "Error"
                break
    }
}

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

async function addNodeOnClick(){
    removeEventListeners()

    $$("form_add_label1").define("label","Добавить"+addFormLabel());
    $$("form_add_label1").refresh();
    $$("form_add_label2").define("label","Введите"+addFormLabel()+": ");
    $$("form_add_label2").refresh();

    showForm("win_add")
}

function nodesClick(){
    /*editButton.disabled = false
    deleteButton.disabled = chosenNode_Type === "OPK";
    addButton.disabled = chosenNode_Type === "Descriptor";*/

    switch (chosenNode_Type){
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

function tableDrawOnClick(){
    mynetwork.style.display = 'none'
    mytable.style.display = 'block'
    tableButton.disabled = true
    tableButton.removeEventListener('click', tableDrawOnClick)
    graphButton.disabled = false

    tableDraw()
}

function tableDraw() {
    mode = "Table"
    addButton.disabled = true
    deleteButton.disabled = true
    editButton.disabled = true
    graphButton.addEventListener('click', graphDrawOnClick)
    addEventListeners()

    let table_data = tableData(parsedNodes, parsedRelationShips)

    webix.ready(function (message) {
        if (grida){
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
                    fillspace:1
                },
                {id: "node_type", header: "Type", width: 250}
            ],
            select: "row",
            autoheight: true,
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

function graphDrawOnClick(){
    mytable.style.display = 'none'
    mynetwork.style.display = 'inline-block'
    graphDraw()
    graphButton.disabled = true
    tableButton.disabled = false
    graphButton.removeEventListener('click', graphDrawOnClick)
}

function graphDraw() {
    mode = "Graph"
    addButton.disabled = true
    deleteButton.disabled = true
    editButton.disabled = true

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

    addEventListeners();
    tableButton.addEventListener('click', tableDrawOnClick)

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

        //console.log("chosen node", chosenNode)
        //console.log("node data", nodeData)
        //console.log("node type",chosenNode_Type)

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


async function onPageLoaded() {
    mynetwork.style.display = 'none'
    mytable.style.display = 'none'
    //let content = document.getElementById("content")
    content.innerHTML = "Загрузка... <img src = \"https://smallenvelop.com/wp-content/uploads/2014/08/Preloader_8.gif\">" //https://smallenvelop.com/wp-content/uploads/2014/08/Preloader_11.gif

    try {
        let response = await fetch('http://' + host.toString() + ':8000/get_data')
        let body = await response.json()
        content.style.display = 'none'
        //addButton.textContent = "Add"

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
            //console.log(parsedNodes)

            parsedRelationShips = body['relationShips'].flat().flat()
            //console.log(parsedRelationShips)

            mynetwork.style.display = 'inline-block'
            tableButton.disabled = false
                /*"<table>" +
                "<tr>" +
                    "<td>" + "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\" fill=\"currentColor\" class=\"bi bi-table\" viewBox=\"0 0 20 16\">\n" +
                        "  <path d=\"M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 0 0 1-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 0 0 1 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z\"/>\n" +
                        "</svg>" +
                    "</td>" +
                    "<td>" +
                        "Добавить<br>компетенцию" +
                    "</td>" +
                "</tr>" + "</table>"
        */
            graphDraw()
        }
        else{
            await addNodeOnClick()
        }
    } catch
        (e) {
        content.innerHTML = "Error" + e
        }

}

onPageLoaded()










