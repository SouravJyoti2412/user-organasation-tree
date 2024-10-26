from django.shortcuts import render
# organization/views.py
from rest_framework import viewsets  
from .models import Person
from .serializers import PersonSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Person
from .serializers import PersonSerializer

class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer




class PersonAddInParent(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        print(data)
        serializer = PersonSerializer(data=data)
        if serializer.is_valid():
            # Save the new person
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


