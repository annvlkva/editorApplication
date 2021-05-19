const host = '127.0.0.1'//'192.168.0.8'
    //let myTable = document.getElementsByClassName("table table-striped")

async function onPageLoaded(){
    //let content = document.getElementById("content")


    //content.innerHTML = "Loading... <img src=\"https://smallenvelop.com/wp-content/uploads/2014/08/Preloader_11.gif\">"
    try {
        let response = await fetch('http://' + host.toString() + ':8000/get_data')
        let body = await response.json()
        //content.innerHTML = ''

        let tree = body['tree'].flat()

        let parsedNodes = tree.map(function (e) {
            return {"id": e['id'], "label": e['label'], "color": e['color'], "level": e['level'], "cyn": e['cyn'], "node_type": e["type"]}
        })
        let parsedRelationShips = body['relationShips'].flat().flat()

        console.log(parsedNodes)
        console.log(parsedRelationShips)

        let data = tableData(parsedNodes, parsedRelationShips)
        console.log("data:   ", data)

        drawTable(data)

        //console.log(tableData)


    } catch
        (e) {
        content.innerHTML = "Error" + e
    }
}

onPageLoaded()


function drawTable(data) {
    webix.ready(function () {
        grida = webix.ui({
            container: "testA",
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
                    console.log()
                    var text = $$("table").getSelectedId(true).join();
                    alert("Selected: " + text)
                }
            },

            data: data
        });
    });
}

function tableData(nodes, edges){
    let data;
    data = [];

    for(let opk of nodes){
        if(opk["node_type"] === "OPK"){
            let ind_data;
            ind_data = [];
            for(let ind of nodes){
                if(ind["node_type"] === "Indicator"){
                    for(let ind_edge of edges){
                        if(ind_edge["from"] === ind["id"] && ind_edge["to"] === opk["id"]){
                            let des_data;
                            des_data = [];
                            for(let des of nodes){
                                if(des["node_type"] === "Descriptor"){
                                    for (let des_edge of edges){
                                        if(des_edge["from"] === des["id"] && des_edge["to"] === ind["id"]){
                                            des_data.push({
                                                "id": des["id"],
                                                "label": des["label"],
                                                "node_type": des["node_type"]
                                            })
                                        }
                                    }
                                }
                            }
                            ind_data.push({
                                "id": ind["id"],
                                "label": ind["label"],
                                "node_type": ind["node_type"],
                                "data": des_data
                            })
                        }
                    }
                }
            }
            data.push({
                "id": opk["id"],
                "label": opk["label"],
                "node_type": opk["node_type"],
                "data": ind_data
            })
        }
    }
    return data
}