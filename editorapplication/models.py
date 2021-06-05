from neomodel import StructuredNode, StringProperty, RelationshipTo, UniqueIdProperty

class Subject(StructuredNode):
    uid = UniqueIdProperty()
    label = StringProperty(index=True)

class OPK(StructuredNode):
    uid = UniqueIdProperty()
    label = StringProperty(index=True)

class Indicator(StructuredNode):
    uid = UniqueIdProperty()
    label = StringProperty(index=True)
    #Relations
    indtoopk = RelationshipTo(OPK, 'sub_of')
    indtosubj = RelationshipTo(Subject, 'sub_of')

class Descriptor(StructuredNode):
    uid = UniqueIdProperty()
    label = StringProperty(index=True)
    #Relations
    destoind = RelationshipTo(Indicator, 'sub_of')

