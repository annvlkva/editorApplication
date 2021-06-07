from editorapplication.models import Descriptor, OPK, Indicator

def descriptor_get():
    desVar = Descriptor.nodes.all()
    response = []
    connections = []

    for var in desVar:
        obj = {
            "id": var.uid,
            "label": var.label,
            "color": "#f7f2e0",
            "level": "4",
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
        d = Descriptor.nodes.get(uid=descriptor["id"])

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
            "color": "#f7f2e0",
            "level": "4",
            "type": "Descriptor",
        }
        return response
    except:
        return {"error": "error"}

def descriptor_delete(uid):
    try:
        obj = Descriptor.nodes.get(uid=uid)
        obj.delete()
        response = "deleted"
        return response
    except Exception as e:
        return "error"

def descriptor_post(parent_id, new_label):
    try:
        obj = Descriptor(label=new_label)
        obj.save()
        response = {
            "id": obj.uid,
            "label": obj.label,
            "color": "#f7f2e0",
            "level": "4",
            "node_type": "Descriptor",
        }
        c = postConnections(parent_id, obj.uid)
        if c != {"error": "error"}:
            return response, c
        return {"error": "error"}
    except Exception as e:
        return {"error": e}

def postConnections(parent_id, new_id):
    try:
        obj1 = Indicator.nodes.get(uid=parent_id)
        obj2 = Descriptor.nodes.get(uid=new_id)
        obj2.destoind.connect(obj1)
        obj = {
            "from": obj2.uid,
            "to": obj1.uid,
            "arrows": "from",
        }
        response = obj

        return response
    except:
        return {"error": "error"}
