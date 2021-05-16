let editButton = document.getElementById("edit_node")
let deleteButton = document.getElementById("delete_node")
let addButton = document.getElementById("add_node")
const host = '127.0.0.1'//'192.168.0.8'

let parsedNodes = []
let parsedRelationShips = []


async function onPageLoaded() {
    editButton.disabled = true
    deleteButton.disabled = true
    addButton.disabled = true

    let container = document.getElementById("mynetwork");

    let content = document.getElementById("content")
    content.innerHTML = "Loading... <img src=\"https://smallenvelop.com/wp-content/uploads/2014/08/Preloader_11.gif\">"
    try {
        let response = await fetch('http://' + host.toString() + ':8000/get_data')
        let body = await response.json()
        content.innerHTML = ''

        if(typeof(body['tree']) != "undefined") {
            let tree = body['tree'].flat()
            parsedNodes = tree.map(function (e) {
                return {
                    "id": e['id'],
                    "label": e['label'],
                    "color": e['color'],
                    "level": e['level'],
                    "node_type": e["type"]
                }
            })
            parsedRelationShips = body['relationShips'].flat().flat()

            var nodes = new vis.DataSet(parsedNodes);

// create an array with edges
            var edges = new vis.DataSet(parsedRelationShips);

// create a network

            data = {
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

            network = new vis.Network(container, data, options);

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
                chosenNode_label = nodeData["label"]
                chosenNode_Type = nodeData["node_type"]
                chosenNode_level = nodeData["level"]
                if (params.nodes.length !== 0) {
                    editButton.disabled = false
                    deleteButton.disabled = chosenNode_Type === "OPK";
                    addButton.disabled = chosenNode_level === "4";
                } else {
                    addButton.disabled = true
                    deleteButton.disabled = true
                    editButton.disabled = true
                }
            })


            //editButton

            editButton.addEventListener('click', editNodeOnClick)

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
                editButton.removeEventListener('click', editNodeOnClick)
                deleteButton.removeEventListener('click', deleteNodeOnClick)
                addButton.removeEventListener('click', addNodeOnClick)

                new_label = ''
                new_label = prompt("Enter label: ");
                if (new_label === '' || new_label == null) {
                    alert("Empty");
                } else {
                    if (ifLabelExists(new_label) === true) {
                        alert("Label already exists!")
                    } else {
                        alert(new_label);
                        let response = await editData('http://' + host.toString() + ':8000/get_data', {
                            label: chosenNode_label, new_label: new_label, type: chosenNode_Type
                        })
                        if (response.status !== 200) {
                            alert(await response.text() + ' ' + response.status.toString())
                            return
                        }
                        onPageLoaded()
                    }
                }
            }


            //deleteButton

            deleteButton.addEventListener('click', deleteNodeOnClick)

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

            async function deleteNodeOnClick() {
                deleteButton.removeEventListener('click', deleteNodeOnClick)
                editButton.removeEventListener('click', editNodeOnClick)
                addButton.removeEventListener('click', addNodeOnClick)
                let response = await deleteData('http://' + host.toString() + ':8000/get_data', {
                    label: chosenNode_label, type: chosenNode_Type
                })
                if (response.status !== 200) {
                    alert(await response.text() + ' ' + response.status.toString())
                    return
                }
                onPageLoaded()
            }


            //addButton

            addButton.addEventListener('click', addNodeOnClick)

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

            async function addNodeOnClick() {
                addButton.removeEventListener('click', addNodeOnClick)
                editButton.removeEventListener('click', editNodeOnClick)
                deleteButton.removeEventListener('click', deleteNodeOnClick)
                new_label = ''
                new_label = prompt("Enter label: ");
                if (new_label === '' || new_label == null) {
                    alert("Empty");
                } else {
                    if (ifLabelExists(new_label) === true)
                        alert("Label already exists!")
                    else {
                        alert(new_label);
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
                        /*if(chosenNode_Type === "OPK"){
                            nodeType = "Indicator"
                        }
                        else {
                            if (chosenNode_Type === "Indicator") {
                                nodeType = "Descriptor"
                            }
                            else {
                                nodeType = "OPK"
                            }
                        }*/

                        let response = await addData('http://' + host.toString() + ':8000/get_data', {
                            label: chosenNode_label, new_label: new_label, type: nodeType
                        })
                        if (response.status !== 201) {
                            alert(await response.text() + ' ' + response.status.toString())
                            return
                        }
                        onPageLoaded()
                    }
                }
            }

            function ifLabelExists(param) {
                for (let entry of parsedNodes) {
                    if (param === entry["label"]) {
                        return true
                    }
                }
                return false
            }
        }
        else{
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

            new_label = prompt("Enter label: ");

            if (new_label === '' || new_label == null) {
                    alert("Empty");
                } else
                    alert(new_label);
                    let response = await addData('http://' + host.toString() + ':8000/get_data', {
                        label: "", new_label: new_label, type: "OPK"
                    })
                    if (response.status !== 201) {
                        alert(await response.text() + ' ' + response.status.toString())
                        return
                    }
                    onPageLoaded()
        }
    } catch
        (e) {
        content.innerHTML = "Error" + e
    }

}

onPageLoaded()
