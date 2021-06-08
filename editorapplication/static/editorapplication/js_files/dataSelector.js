//Функция для получения дескрипторов связанных с индикатором
function get_descriptors(nodes, edges, ind) {
    let des_data
    des_data = []
    let des_nodes = nodes.filter(n => n["node_type"] === "Descriptor")
    for(let des of des_nodes){
        let des_edge = edges.find(function (element){
            return element["from"] === des["id"] && element["to"] === ind["id"]
        })
        if(des_edge){
            des_data.push({
                "id": des["id"],
                "label": des["label"],
                "open": "true",
                $css:{"background-color": "#f7f2e0" },
                "node_type": des["node_type"]
            })
        }
    }
    return des_data
}

//Получить id компетенции по индикатору
function getOPKId(nodes, edges, graphId){
    let edge = edges.filter(e => e["from"] === graphId)
    for (let e of edge) {
        let node = nodes.find(function (element) {
            return element["id"] === e["to"] && element["node_type"] === "OPK"
        })
        if(node !== "undefined"){
            return node
        }
    }
    return false
}

//Функция для получения индикаторов связанных с компетенцией
function get_opk_indicators(nodes, edges, opk){
    let ind_data;
    ind_data = [];
    let ind_nodes = nodes.filter(n => n["node_type"] === "Indicator")
    for(let ind of ind_nodes){
        let ind_edge = edges.find(function (element){
            return element["from"] === ind["id"] && element["to"] === opk["id"]
        })
        if(ind_edge){
            ind_data.push({
                "id": ind["id"],
                "label": ind["label"],
                "open": "true",
                $css:{"background-color": "#ecf8e0" },
                "node_type": ind["node_type"],
                "data": get_descriptors(nodes, edges, ind)
            })
        }
    }
    return ind_data
}

//Функция для получения данных таблицы компетенции
function tableData(nodes, edges, opk_id){
    let data;
    data = [];
    let opk = nodes.find(function (element){
        return element["id"] === opk_id
    })
    if(opk){
        data.push({
            "id": opk["id"],
            "label": opk["label"],
            "open": "true",
            $css:{"background-color": "#e0f8f1" },
            "node_type": opk["node_type"],
            "data": get_opk_indicators(nodes, edges, opk)
        })
    }
    return data
}

//Функция для получения данных графа по компетенции
function graphData(nodes, edges, opk_id){
    let graph_nodes, graph_edges;
    graph_nodes = [];
    graph_edges = [];
    let opk = nodes.find(function (element){
        return element["id"] === opk_id
    })
    if(opk){
        graph_nodes.push(opk)
        let ind_nodes = nodes.filter(i => i["node_type"] === "Indicator")
        for (let ind of ind_nodes){
            let edge = edges.find(function (element){
                return element["from"] === ind["id"] && element["to"] === opk["id"]
            })
            if(edge){
                graph_edges.push(edge)
                graph_nodes.push(ind)
                let des_nodes = nodes.filter(i => i["node_type"] === "Descriptor")
                for(let des of des_nodes) {
                    let edge = edges.find(function (element) {
                        return element["from"] === des["id"] && element["to"] === ind["id"]
                    })
                    if (edge) {
                        graph_edges.push(edge)
                        graph_nodes.push(des)
                    }
                }
            }
        }
    }
    return {"nodes": graph_nodes, "edges": graph_edges}
}

//Функиця для получения индикаторов дисциплины
function get_subject_indicators(nodes, edges, subj, id){
    let ind_data;
    ind_data = [];
    let ind_nodes = nodes.filter(n => n["node_type"] === "Indicator")
    for(let ind of ind_nodes){
        let ind_edge = edges.find(function (element){
            return element["from"] === ind["id"] && element["to"] === subj["id"]
        })
        if(ind_edge){
            id += 1
            ind_data.push({
                "id": id,
                "node_id": ind["id"],
                "label": ind["label"],
                "node_type": ind["node_type"],
                "open": "true",
                $css:{ "background-color": "#ecf8e0" }
            })
        }
    }
    return {"data":ind_data, "id": id}
}

//Функция для получения данных таблицы дисциплин
function mainTableData(nodes, edges){
    let id = 0
    let data;
    data = [];

    let subj_nodes = nodes.filter(s => s["node_type"] === "Subject")
    for(let subj of subj_nodes) {
        id += 1
        let ind_data = get_subject_indicators(nodes, edges, subj, id)
        data.push({
            "id": id,
            "node_id": subj["id"],
            "label": subj["label"],
            "node_type": subj["node_type"],
            "open": "true",
            $css: {"background-color": "#e0ecf8"},
            "data": ind_data["data"]
        })
        id = ind_data["id"]
    }
    return data
}

//Функция для получения данных графа дисциплин
function mainGraphData(nodes, edges){
    let data_nodes
    data_nodes = []
    let data_edges
    data_edges = []

    let subj_nodes = nodes.filter(s => s["node_type"] === "Subject")
    for (let subj of subj_nodes){
        data_nodes.push(subj)
        let ind_nodes = nodes.filter(i => i["node_type"] === "Indicator")
        for(let ind of ind_nodes){
            let edge = edges.find(function (element){
                return element["from"] === ind["id"] && element["to"] === subj["id"]
            })
            if(edge){
                data_edges.push(edge)
                if(!checkIfExists(data_nodes, ind["id"])) {
                    data_nodes.push(ind)
                }
            }
        }
    }
    return {"nodes": data_nodes, "edges": data_edges}
}

//Функция для получения списка индикаторов
function getIndicatorList(nodes){
    let data;
    data = [];
    let tmp_data = nodes.filter(ind => ind["node_type"] === 'Indicator')
    tmp_data.forEach(tmp => data.push({
        "id":tmp["id"],
        "value":tmp["label"]
    }))
    return data
}

//Функция для получения списка компетенций
function getOPKList(nodes){
    let data
    data = []
    let tmp_data = nodes.filter(opk => opk["node_type"] === 'OPK')
    tmp_data.forEach(tmp => data.push({
        "id":tmp["id"],
        "value":tmp["label"]
    }))
    return data
}

//Функция для получения инструкции пользования приложением
function getHelpData(){
    let data
    data = [
        { id:"1", value:"Просмотр всего графа", data:[
                { id:"1.1", value:"Чтобы посмотреть весь граф, нажмите на кнопку 'Просмотр'.",
                    $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#effbf8"} },
                { id:"1.2", value:"Чтобы скрыть весь граф, нажмите на кнопу 'Закрыть'.",
                $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#f8fbef"}},
            ]},
        { id:"2", value:"Работа с дисциплинами", data:[
            { id:"2.1", value:"Чтобы добавить новую дисциплину, нажмите кнопку 'Дисциплина'." ,
                $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#effbf8"}},
            { id:"2.2", value:"Чтобы добавить новый индикатор, нажмите кнопку 'Индикатор'. " +
                    "Выберите нужный и нажмите 'ОК'" +
                    "Если из предложенных нет нужного, нажмите 'Новый индикатор'. " +
                    "Выберите компетенцию, к которой будет привязан индикатор, введите индикатор, нажмите 'ОК'. " +
                    "Если нет нужной компетенции, нажмите 'Новая компетенция', введите компетенцию, нажмите 'ОК'." ,
                $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#f8fbef"}},
            { id:"2.3", value:"Чтобы удалить элемент, нажмите кнопку 'Удалить'",
                $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#effbf8"}},
            { id:"2.4", value:"Чтобы редактировать элемент, нажмите кнопку 'Редактировать'. " +
                    "Введите новое название элемента, нажмите 'ОК'.",
                $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#f8fbef"}},
            { id:"2.5", value:"Чтобы посмотреть данные в виде графа, нажмите 'Граф'." ,
            $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#effbf8"}},
            { id:"2.6", value:"Чтобы посмотреть данные в табличном виде, нажмите 'Таблица'." ,
            $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#f8fbef"}},
            { id:"2.7", value:"Чтобы посмотреть компетенцию, выберите индикатор, нажмите 'Перейти'.",
            $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#effbf8"}},
        ]},
        { id:"3", value:"Работа с компетенцией", data:[
            { id:"3.1", value:"Чтобы добавить новый элемент, нажмите кнопку 'Добавить'." +
                    "Введите новое название элемента, нажмите 'ОК'.",
            $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#effbf8"}},
            { id:"3.2", value:"Чтобы редактировать элемент, нажмите кнопку 'Редактировать'. " +
                    "Введите новое название элемента, нажмите 'ОК'." ,
            $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#f8fbef"}},
            { id:"3.3", value:"Чтобы удалить элемент, нажмите кнопку 'Удаить'.",
            $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#effbf8"}},
            { id:"3.4", value:"Чтобы посмотреть данные в виде графа, нажмите 'Граф'.",
            $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#f8fbef"}},
            { id:"3.5", value:"Чтобы посмотреть данные в табличном виде, нажмите 'Таблица'." ,
            $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#effbf8"}},
            { id:"3.6", value:"Чтобы посмотреть компетенцию, выберите индикатор, нажмите 'Перейти'.",
            $css: {"height":"auto", "overflow":"visible !important", "white-space": "normal", "background-color": "#f8fbef"}},
        ]}
    ]
    return data
}

//Функция проверки, что узел с таким идентификатором уже добавлен в список узлов
function checkIfExists(nodes, node_id){
    return  nodes.find(function (element){
            return element["id"] === node_id
    })
}
