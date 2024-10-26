
from rest_framework import serializers
from .models import Person

class PersonSerializer(serializers.ModelSerializer):
    # Recursively serialize the children of each person
    children = serializers.SerializerMethodField()

    class Meta:
        model = Person
        fields = ['id', 'name', 'parent', 'children']

    def get_children(self, obj):
        # Get the children of the current person (obj)
        children = obj.children.all()
        return PersonSerializer(children, many=True).data
