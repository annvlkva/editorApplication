const host = '127.0.0.1'//'192.168.0.8'
let myTable = document.getElementsByClassName("table table-striped")

async function onPageLoaded(){
    let content = document.getElementById("content")


    content.innerHTML = "Loading... <img src=\"https://smallenvelop.com/wp-content/uploads/2014/08/Preloader_11.gif\">"
    try {
        let response = await fetch('http://' + host.toString() + ':8000/get_data')
        let body = await response.json()
        content.innerHTML = ''

        let tree = body['tree'].flat()

        let parsedNodes = tree.map(function (e) {
            return {"id": e['id'], "label": e['label'], "color": e['color'], "level": e['level'], "cyn": e['cyn'], "node_type": e["type"]}
        })
        let parsedRelationShips = body['relationShips'].flat().flat()

        console.log(parsedNodes)
        console.log(parsedRelationShips)

        mkTbl('50px', 5)



        /*var $table = $('#table')

        $(function(){
            var tableData = dataToTable(parsedNodes, parsedRelationShips)
            $table.bootstrapTable({data: tableData})
        })*/






        //console.log(tableData)


    } catch
        (e) {
        content.innerHTML = "Error" + e
    }
}

onPageLoaded()

function dataToTable(nodes, edges){
    let response = []
    for (let opk of nodes){
        if(opk["node_type"] === "OPK"){
            col1 = opk["label"]
            col2 = []
            for (let des of nodes){
                if (des["node_type"] === "Descriptor"){
                    for (let edge of edges){
                        if(edge["from"] === des["id"] && edge["to"] === opk["id"]){
                            col2.push(des["label"])
                        }
                    }
                }
            }
            response.push({"OPK": col1, "Descriptors": col2})
        }
    }

    return response

}