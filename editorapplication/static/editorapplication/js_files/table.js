var grida
/*
function drawTable(data) {
    webix.ready(function () {
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
                    var id = $$("table").getSelectedId(true).join();
                    alert("Selected: " + id)
                }
            },
            data: data
        });
    });
}*/

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