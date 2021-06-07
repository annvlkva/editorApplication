from editorapplication.models import Subject

def subject_get():
    subjVar = Subject.nodes.all()
    response = []

    for var in subjVar:
        obj = {
            "id": var.uid,
            "label": var.label,
            "color": "#e0ecf8",
            "level": "1",
            "type": "Subject",
        }
        response.append(obj)
    return response

def subject_put(uid, new_label):
    obj = Subject.nodes.get(uid=uid)
    obj.label = new_label
    obj.save()
    response = {
        "id": obj.uid,
        "label": obj.label,
        "color": "#e0ecf8",
        "level": "1",
        "type": "Subject",
    }
    return response

def subject_post(label):
    try:
        obj = Subject(label=label)
        obj.save()
        response = {
            "id": obj.uid,
            "label": obj.label,
            "color": "#e0ecf8",
            "level": "1",
            "node_type": "Subject",
        }
        return response

    except Exception as e:
        return {"error": e}

def subject_delete(uid):
    try:
        obj = Subject.nodes.get(uid=uid)
        obj.delete()
        response = "deleted"
        return response
    except:
        return "error"
