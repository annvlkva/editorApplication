from editorapplication.models import Indicator, OPK

def indicator_get():
    indVar = Indicator.nodes.all()
    response = []
    connections = []

    for var in indVar:
        obj = {
            "id": var.uid,
            "label": var.label,
            "color": "#b2fef7",
            "level": "2",
            "type": "Indicator",
        }

        c = getConnections(obj)
        if c and c != {"error": "error"}:
            connections.append(c)

        response.append(obj)
    return response, connections


def getConnections(indicator):
    try:
        response = []
        i = Indicator.nodes.get(uid=indicator["uid"])
        for parent in i.indtoopk:
            obj = {
                "from": indicator["id"],
                "to": parent.uid,
                "arrows": "from",
            }
            response.append(obj)
        return response
    except Exception as e:
        response = {"error": ["Error is", str(e)]}
        return response


def indicator_put(uid, new_label):
    obj = Indicator.nodes.get(uid=uid)
    obj.label = new_label
    obj.save()
    response = {
        "id": obj.uid,
        "label": obj.label,
    }
    return response

def indicator_delete(uid):
    obj = Indicator.nodes.get(uid=uid)
    obj.delete()
    response = {"success": "deleted"}
    return response

def indicator_post(parent_label, new_label):
    try:
        obj = Indicator(label=new_label)
        obj.save()
        response = {
            "id": obj.uid
        }
        c= postConnections(parent_label, obj.label)
        if c != {"error": "error"}:
            return response
        return {"error": "error"}
    except Exception as e:
        return {"error": e}


def postConnections(parent_label, new_label):
    try:
        obj1 = OPK.nodes.get(label=parent_label)
        obj2 = Indicator.nodes.get(label=new_label)
        res = obj2.indtoopk.connect(obj1)
        response = {"result": res}

        return response
    except:
        return {"error": "error"}
