from editorapplication.models import Indicator, OPK, Subject

#Функция получения списка индикаторов
def indicator_get():
    indVar = Indicator.nodes.all()
    response = []
    connections = []

    for var in indVar:
        obj = {
            "id": var.uid,
            "label": var.label,
            "color": "#ecf8e0",
            "level": "3",
            "type": "Indicator",
        }

        c = getConnections(obj)
        if c and c != {"error": "error"}:
            connections.append(c)

        response.append(obj)
    return response, connections

#Функция получения связей индикатора
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
        for parent in i.indtosubj:
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

#Функция редактирования индикатора
def indicator_put(uid, new_label):
    obj = Indicator.nodes.get(uid=uid)
    obj.label = new_label
    obj.save()
    response = {
        "id": obj.uid,
        "label": obj.label,
        "color": "#ecf8e0",
        "level": "3",
        "type": "Indicator",
    }
    return response

#Функция удаления индикатора
def indicator_delete(uid):
    try:
        obj = Indicator.nodes.get(uid=uid)
        obj.delete()
        response = "deleted"
        return response
    except:
        return "error"

#Функция удаления связи индикатора с дисциплиной
def indtosubj_delete(uid, parent_id):
    try:
        obj1 = Subject.nodes.get(uid=parent_id)
        obj2 = Indicator.nodes.get(uid=uid)
        obj2.indtosubj.disconnect(obj1)
        response = "deleted"
        return response
    except:
        return {"error": "error"}

#Функция добавления индикатора
def indicator_post(parent_id, new_label):
    try:
        obj = Indicator(label=new_label)
        obj.save()
        response = {
            "id": obj.uid,
            "label": obj.label,
            "color": "#ecf8e0",
            "level": "3",
            "node_type": "Indicator",
        }
        c = postConnections(parent_id, obj.uid)
        if c != {"error": "error"}:
            return response, c
        return {"error": "error"}
    except Exception as e:
        return {"error": e}

#Функция добавления связи с компетенцией
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

#Функция добавления связи с дисциплиной
def indtosubjPost(parent_id, new_id):
    try:
        obj1 = Subject.nodes.get(uid=parent_id)
        obj2 = Indicator.nodes.get(uid=new_id)
        obj2.indtosubj.connect(obj1)
        obj = {
            "from": obj2.uid,
            "to": obj1.uid,
            "arrows": "from",
        }
        return obj
    except:
        return {"error": "error"}
