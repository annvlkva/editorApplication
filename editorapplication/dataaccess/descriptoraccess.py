from editorapplication.models import Descriptor, OPK, Indicator


def descriptor_get():
    desVar = Descriptor.nodes.all()
    response = []
    connections = []

    for var in desVar:
        obj = {
            "id": var.id,
            "label": var.label,
            "color": "#90caf9",
            "level": "3",
            "type": "Descriptor",
        }
        response.append(obj)

        c = getConnections(obj)
        if c and c != {"error": "error"}:
            connections.append(c)

    return response, connections

def getConnections(descriptor):
    try:
        response = []
        d = Descriptor.nodes.get(uid=descriptor["uid"])

        for p in d.destoind:
            obj = {
                "from": descriptor["id"],
                "to": p.uid,
                "arrows": "from",
            }
            print(obj)
            response.append(obj)

        return response
    except Exception as e:
        response = {"error": "error"}
        return response


def descriptor_put(uid, new_label):
    try:
        obj = Descriptor.nodes.get(uid=uid)
        obj.label = new_label
        obj.save()
        response = {
            "id": obj.uid,
            "label": obj.label,
        }
        return response
    except:
        return {"error": "error"}

def descriptor_delete(uid):
    try:
        obj = Descriptor.nodes.get(uid=uid)
        obj.delete()
        response = {"success": "deleted"}
        return response
    except Exception as e:
        return {"error": e}

def descriptor_post(parent_label, new_label):
    try:
        obj = Descriptor(label=new_label)
        obj.save()
        response = {
            "id": obj.uid
        }
        c = postConnections(parent_label, obj.label)
        if c != {"error": "error"}:
            return response
        return {"error": "error"}
    except Exception as e:
        return {"error": e}

def postConnections(parent_label, new_label):
    try:
        obj1 = Indicator.nodes.get(label=parent_label)
        obj2 = Descriptor.nodes.get(label=new_label)
        res = obj2.destoind.connect(obj1)
        response = {"result": res}

        return response
    except:
        return {"error": "error"}
