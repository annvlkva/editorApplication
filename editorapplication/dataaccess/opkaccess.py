from editorapplication.models import OPK

def opk_get():
    opkVar = OPK.nodes.all()
    response = []

    for var in opkVar:
        obj = {
            "id": var.uid,
            "label": var.label,
            "color": "#9fa8da",
            "level": "1",
            "type": "OPK",
        }
        response.append(obj)
    return response

def opk_put(uid, new_label):
    obj = OPK.nodes.get(uid=uid)
    obj.label = new_label
    obj.save()
    response = {
        "id": obj.uid,
        "label": obj.label,
    }
    return response

def opk_post(label):
    try:
        obj = OPK(label=label)
        obj.save()
        response = {
            "id": obj.uid,
        }
        return response

    except Exception as e:
        return {"error": e}

