from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status

from editorapplication.dataaccess.descriptoraccess import descriptor_get, descriptor_put, descriptor_delete, \
    descriptor_post
from editorapplication.dataaccess.opkaccess import opk_get, opk_put, opk_post
from editorapplication.dataaccess.indicatoraccess import indicator_get, indicator_put, indicator_delete, indicator_post


@api_view(['GET', 'POST', 'DELETE', 'PUT'])
def data(request):
    if request.method == 'GET':
        try:
            response = []
            relationShips = []
            obj = opk_get()
            if (obj):
                response.append(obj)
                indicators, connections = indicator_get()
                if indicators:
                    response.append(indicators)
                    if connections:
                        relationShips.append(connections)
                descriptors, connections = descriptor_get()
                if descriptors:
                    response.append(descriptors)
                    if connections:
                        relationShips.append(connections)
            else:
                return JsonResponse({"nodes": "empty"}, safe=False)

            print(response)
            return JsonResponse({"tree": response, "relationShips": relationShips}, safe=False)

        except Exception as e:
            response = {"error": ["Error is ", str(e)]}
            # return response
            return JsonResponse(response, status=status.HTTP_500_INTERNAL_SERVER_ERROR, safe=False)

    if request.method == 'PUT':
        try:
            id = request.data["id"]
            new_label = request.data["new_label"]
            node_type = request.data["type"]

            if node_type == "OPK":
                response = opk_put(id, new_label)
                return JsonResponse({"tree": response}, safe=False)
            if node_type == "Descriptor":
                response = descriptor_put(id, new_label)
                return JsonResponse({"tree": response}, safe=False)
            if node_type == "Indicator":
                response = indicator_put(id, new_label)
                return JsonResponse({"tree": response}, safe=False)

        except Exception as e:
            response = {"error": ["Error is ", str(e)]}
            return JsonResponse(response, safe=False)

    if request.method == "DELETE":
        try:
            uid = request.data["id"]
            node_type = request.data["type"]

            if node_type == "Descriptor":
                response = descriptor_delete(uid)
                return JsonResponse({"deleted": response}, safe=False)
            if node_type == "Indicator":
                response = indicator_delete(uid)
                return JsonResponse({"deleted": response}, safe=False)

        except Exception as e:
            response = {"error": ["Error is ", str(e)]}
            print(response)
            return JsonResponse(response, safe=False)

    if request.method == "POST":
        try:
            node_type = request.data["type"]
            #parent_label = request.data["label"]
            new_label = request.data["new_label"]

            if node_type == "OPK":
                response = opk_post(new_label)
                return JsonResponse({"tree": response}, status=status.HTTP_201_CREATED)
            if node_type == "Indicator":
                parent_id = request.data["id"]
                response, relations = indicator_post(parent_id, new_label)
                return JsonResponse({"tree": response, "relationShips": relations}, status=status.HTTP_201_CREATED)
            if node_type == "Descriptor":
                parent_id = request.data["id"]
                response, relations = descriptor_post(parent_id, new_label)
                return JsonResponse({"tree": response, "relationShips": relations}, status=status.HTTP_201_CREATED)

        except Exception as e:
            response = {"error": ["Error is ", str(e)]}
            return JsonResponse(response, status=status.HTTP_500_INTERNAL_SERVER_ERROR, safe=False)








