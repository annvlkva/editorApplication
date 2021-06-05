//Функция для получения дескрипторов связанных с индикатором
function get_descriptors(nodes, edges, ind){
    let des_data;
    des_data = [];
    for(let des of nodes){
        if(des["node_type"] === "Descriptor"){
            for (let des_edge of edges){
                if(des_edge["from"] === des["id"] && des_edge["to"] === ind["id"]){
                    des_data.push({
                        "id": des["id"],
                        "label": des["label"],
                        "open": "true",
                        $css:{ "background-color": "#b2fef7" },
                        "node_type": des["node_type"]
                    })
                }
            }
        }
    }
    return des_data
}

//Получить id компетенции по индикатору
function getOPKId(nodes, edges, graphId){
    for(let ind of nodes){
        if(ind["id"] === graphId){
            for(let edge of edges){
                if(edge["from"] === ind["id"]){
                    let tmpId = edge["to"]
                    for(let n of nodes){
                        if(n["id"] === tmpId && n["node_type"] === "OPK"){
                            return n
                        }
                    }
                }
            }
        }
    }
    return n
}

//Функция для получения индикаторов связанных с компетенцией
function get_opk_indicators(nodes, edges, opk){
    let ind_data;
    ind_data = [];
    for(let ind of nodes){
        if(ind["node_type"] === "Indicator"){
            for(let ind_edge of edges){
                if(ind_edge["from"] === ind["id"] && ind_edge["to"] === opk["id"]){
                    ind_data.push({
                        "id": ind["id"],
                        "label": ind["label"],
                        "node_type": ind["node_type"],
                        "open": "true",
                        $css:{ "background-color": "#90caf9" },
                        "data": get_descriptors(nodes, edges, ind)//des_data
                    })
                }
            }
        }
    }
    return ind_data
}

//Функция для получения данных таблицы компетенции
function tableData(nodes, edges, opk_id){
    let data;
    data = [];
    for(let opk of nodes){
        if(opk["node_type"] === "OPK" && opk["id"] === opk_id){
            data.push({
                "id": opk["id"],
                "label": opk["label"],
                "node_type": opk["node_type"],
                "open": "true",
                $css:{ "background-color": "#9fa8da" },
                "data": get_opk_indicators(nodes, edges, opk)
            })
        }
    }
    return data
}

//Функция для получения данных графа по компетенции
function graphData(nodes, edges, opk_id){
    let graph_nodes, graph_edges;
    graph_nodes = [];
    graph_edges = [];
    for(let opk of nodes){
        if(opk["node_type"] === "OPK" && opk["id"] === opk_id){
            graph_nodes.push(opk)
            for(let ind of nodes){
                if(ind["node_type"] === "Indicator"){
                    for(let edge_ind of edges){
                        if(edge_ind["from"] === ind["id"] && edge_ind["to"] === opk["id"]){
                            graph_nodes.push(ind)
                            graph_edges.push(edge_ind)
                            for(let des of nodes){
                                if(des["node_type"] === "Descriptor"){
                                    for(let edge_des of edges){
                                        if(edge_des["from"] === des["id"] && edge_des["to"] === ind["id"]){
                                            graph_nodes.push(des)
                                            graph_edges.push(edge_des)
                                        }
                                    }
                                }
                            }
                        }
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
    for(let ind of nodes){
        if(ind["node_type"] === "Indicator"){
            for(let ind_edge of edges){
                if(ind_edge["from"] === ind["id"] && ind_edge["to"] === subj["id"]){
                    id += 1
                    ind_data.push({
                        "id": id,
                        "node_id": ind["id"],
                        "label": ind["label"],
                        "node_type": ind["node_type"],
                        "open": "true",
                        $css:{ "background-color": "#90caf9" },
                    })
                }
            }
        }
    }
    return {"data":ind_data, "id": id}
}

//Функция для получения данных таблицы дисциплин
function mainTableData(nodes, edges){
    let id = 0
    let data;
    data = [];
    for(let subj of nodes){
        if(subj["node_type"] === "Subject") {
            id += 1
            let ind_data = get_subject_indicators(nodes, edges, subj, id)
            data.push({
                "id": id,
                "node_id": subj["id"],
                "label": subj["label"],
                "node_type": subj["node_type"],
                "open": "true",
                $css: {"background-color": "#9fa8da"},
                "data": ind_data["data"]
            })
            id = ind_data["id"]
        }
    }
    return data
}

//Функция для получения данных графа дисциплин
function mainGraphData(nodes, edges){
    let data_nodes
    data_nodes = []
    let data_edges
    data_edges = []

    for(let subj of nodes){
        if(subj["node_type"] === "Subject"){
            data_nodes.push(subj)
            for(let ind of nodes){
                if(ind["node_type"] === "Indicator"){
                    for(let edge of edges){
                        if(edge["from"] === ind["id"] && edge["to"] === subj["id"]){
                            data_edges.push(edge)
                            if(checkIfExists(data_nodes, ind["id"]) === false) {
                                data_nodes.push(ind)
                            }
                        }
                    }
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
    for(let ind of nodes){
        if(ind["node_type"] === "Indicator") {
            data.push({
                "id": ind["id"],
                "value": ind["label"]
            })
        }
    }
    return data
}

//Функция для получения списка компетенций
function getOPKList(nodes){
    let data
    data = []
    for(let opk of nodes){
        if(opk["node_type"] === "OPK"){
            data.push({
                "id": opk["id"],
                "value": opk["label"]
            })
        }
    }
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

function checkIfExists(nodes, node_id){
    for(let n of nodes){
        if(n["id"] === node_id){
            return true
        }
    }
    return false
}
