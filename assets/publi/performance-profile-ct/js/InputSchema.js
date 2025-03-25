var schema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title": "Input Data Schema",
    "description": "Schema for the input data used to build the performance profile",
    "type": "object",
    "properties": {
        "metric" : {
            "description": "Name of the metric to be used",
            "type": "string"
        },
        "labels": {
            "description": "Labels that can be associated to an instance",
            "type": "array",
            "items": {
                    "description": "A label that can be attached to an instance to caracterize it",
                    "type" : "string"
                },
            "uniqueItems": true
        },
        "instances": {
            "description": "Array of arrays (one for each instance) of label indices referring to the label array",
            "type": "array",
            "items": {
                    "description": "An array of indices of the label array",
                    "type" : "array",
                    "items" : {
                        "description" : "An id of the label array",
                        "type": "integer",
                        "minimum": 0,
                        "uniqueItems": true
                    }
                },
            "uniqueItems": false
        },
        "data": {
            "description": "Object containing each approach data (as a property).",
            "type": "object",
            "additionalProperties": {
                "description": "Object containing each metric component of an approach. For the ith instance, the total amount of metric equals the sum of the ith element of each metric component.",
                "type": "object",
                "additionalProperties": {
                    "description": "Array of amount of metric for all instances (ith element corresponds to the ith instance) for a given metric component.",
                    "type": "array",
                    "items": {
                        "description": "Amount of metric for a given instance.",
                        "type": "number",
                        "minimum": 0
                    }   
                },
                "minProperties": 1
            },
            "minProperties": 1
        }
    },
    "required": ["metric", "labels", "instances", "data"],
    "additionalProperties": false,
};