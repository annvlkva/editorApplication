from editorapplication.models import OPK

#Функция получения компетенция
def opk_get():
    opkVar = OPK.nodes.all()
    response = []

    for var in opkVar:
        obj = {
            "id": var.uid,
            "label": var.label,
            "color": "#e0f8f1",
            "level": "2",
            "type": "OPK",
        }
        response.append(obj)
    return response

#Функция редактирования компетенции
def opk_put(uid, new_label):
    obj = OPK.nodes.get(uid=uid)
    obj.label = new_label
    obj.save()
    response = {
        "id": obj.uid,
        "label": obj.label,
        "color": "#e0f8f1",
        "level": "2",
        "type": "OPK",
    }
    return response

#Функция добавления компетенции
def opk_post(label):
    try:
        obj = OPK(label=label)
        obj.save()
        response = {
            "id": obj.uid,
            "label": obj.label,
            "color": "#e0f8f1",
            "level": "2",
            "node_type": "OPK",
        }
        return response

    except Exception as e:
        return {"error": e}

#Функция удвления компетенции
def opk_delete(uid):
    try:
        obj = OPK.nodes.get(uid=uid)
        obj.delete()
        response = "deleted"
        return response
    except:
        return "error"