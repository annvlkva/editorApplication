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
        i = Indicator.nodes.get(uid=indicator["id"])
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
        "color": "#b2fef7",
        "level": "2",
        "type": "Indicator",
    }
    return response

def indicator_delete(uid):
    try:
        obj = Indicator.nodes.get(uid=uid)
        obj.delete()
        response = "deleted"
        return response
    except:
        return "error"

def indicator_post(parent_id, new_label):
    try:
        obj = Indicator(label=new_label)
        obj.save()
        response = {
            "id": obj.uid,
            "label": obj.label,
            "color": "#b2fef7",
            "level": "2",
            "node_type": "Indicator",
        }
        c = postConnections(parent_id, obj.uid)
        if c != {"error": "error"}:
            return response, c
        return {"error": "error"}
    except Exception as e:
        return {"error": e}


def postConnections(parent_id, new_id):
    try:
        obj1 = OPK.nodes.get(uid=parent_id)
        obj2 = Indicator.nodes.get(uid=new_id)
        obj2.indtoopk.connect(obj1)
        obj = {
            "from": obj2.uid,
            "to": obj1.uid,
            "arrows": "from",
        }
        return obj
    except:
        return {"error": "error"}
