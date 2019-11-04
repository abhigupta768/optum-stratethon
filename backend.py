from flask import Flask, request, jsonify
import time
import json
import regex
app = Flask(__name__)
regexps = dict()

@app.route("/")
def echo():
    return json.dumps({"started":"true"})

@app.route("/add_rule", methods=['POST'])
def add_rule():
    """Adds rule.

    JSON Args:
        ruleset: Name of the document type eg. Cargo-Slips, Insurance-Documents
        tags: a list of field and context
            field: Name of the field. eg. "Insured"
            data: Info of interest
            context: Context around the data (including the data). eg. "Insured:\n\nABC, Inc and/or Associated"

    Demo data:
    {
    	"ruleset":"Cargo Slip",
    	"tags":[
    		{
    			"field":"Company-Name",
    			"data":"Lloyd & Partners Pvt. Ltd.",
    			"context":"are Lloyd & Partners Pvt. Ltd. not"
    		},
    		{
    			"field":"Balance-Paid",
    			"data":"1,500,000",
    			"context":"USD 1,500,000 any"
    		},
    		{
    			"field":"Policy-ID",
    			"data":"B0000DC1234567000",
    			"context":"Reference:        B0000DC1234567000 Attaching"
    		}
    	]
    }
    """

    ruleset = request.json['ruleset']
    regexps[ruleset] = dict()

    for field_dict in request.json['tags']:
        context = field_dict['context']
        field = field_dict['field']
        data = field_dict['data']

        if data not in context:
            return 'Context should contain data.'

        data_pattern = '(['
        if regex.search(r'[a-z]', data):
            data_pattern += 'a-z'
        if regex.search(r'[A-Z]', data):
            data_pattern += 'A-Z' 
        if regex.search(r'[0-9]', data):
            data_pattern += '0-9'
        if regex.search(r'\s', data):
            data_pattern += r'\s'
        if regex.search(r'[^a-zA-Z0-9\s]', data):
            data_pattern += '.'
        data_pattern += ']{0,' + str(len(data) + 20) + '})'

        pattern = context.replace(data, data_pattern)
        regexps[ruleset][field] = pattern

    return "200"

@app.route("/extract", methods=['POST'])
def extract():
    """Extracts data.

    JSON Args:
        ruleset: Name of the document type eg. Cargo-Slips, Insurance-Documents
        text: Text extracted from document through OCR.

    Demo Data:
    {
        "ruleset":"Cargo Slip",
        "files":[
            {
                "name": "/home/akshay/Downloads/SOV_2.pdf",
                "content": "are Google Inc. not USD 20,000 any Reference:        F0000DC1234567000 Attaching"
            },
            {
                "name": "/home/akshay/Downloads/Sample_2_IIT.pdf",
                "content": "are Facebook LLC. not USD 100,000 any Reference:        F0000FF1234567000 Attaching"
            }
        ]
    }

    Returns:
        data: Map of field and corresponding data
    """

    ruleset = request.json['ruleset']
    output = dict()

    for file_dict in request.json['files']:
        name = file_dict['name'] 
        content = file_dict['content']
        output[name] = []
        
        regexps_ruleset = regexps.get(ruleset, dict())
        for field in regexps_ruleset.keys():
            regexp = regexps_ruleset[field]
            result = regex.search("(?b)(%s){e<=7}" % regexp, content)

            temp = {"key":field}

            if result is None:
                temp["val"] = " "
            else:
                if len(result.groups())>1:
                    temp["val"] = result.groups()[1]
                else:
                    temp["val"] = " "
            output[name].append(temp)

    return jsonify(output)

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5122)
