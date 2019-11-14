from flask import Flask, request, jsonify
import time
import json
import regex
import pandas as pd
import numpy as np
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from sklearn.preprocessing import StandardScaler
import pickle as p
app = Flask(__name__)
regexps = dict()

@app.route("/")
def echo():
    return json.dumps({"started":"true"})

def scale(X_train, X_test, X_val = np.empty([0,])):
    std=p.load(open("./model/scaler.p","rb"))
    X_tr = std.transform(X_train.values)
    X_te = std.transform(X_test.values)
    
    #When I want to test the set and the data
    if X_val.size != 0 :
        X_va = std.transform(X_val.values)
        return X_tr, X_te, X_va
    return X_tr, X_te


@app.route("/predict", methods=['POST'])
def predict():
    recordID = request.json['recordID']
    master = pd.read_csv("master.csv")
    data = master[master['RecordID']==int(recordID)]
    ts = data['Timestamp'].tolist()
    ts = sorted(ts)
    timestamp = ts[-1]
    data = pd.DataFrame(data.mean()).transpose()
    data = data.drop(columns=['Timestamp', 'RecordID'])
    mif = p.load(open("./model/mif.p","rb"))
    missing_iv = []
    for vital in mif:
        if data[vital].isnull()[0]==True:
            missing_iv.append(vital)
    if len(missing_iv) is 0:
        missing_iv = "None"
    data.loc[(data.Gender < 0),'Gender'] = np.NaN
    data.loc[(data.Weight < 30),'Weight'] = np.NaN
    data.loc[(data.DiasABP < 10),'DiasABP'] = np.NaN
    data.loc[(data.SysABP < 10),'SysABP'] = np.NaN
    data.loc[(data.MAP < 10),'MAP'] = np.NaN
    imp=p.load(open("./model/imputer.p","rb"))
    data_t = imp.transform(data)
    data_t = pd.DataFrame(data_t, columns=data.columns)
    data_t, data_t = scale(data_t, data_t)
    model = p.load(open("./model/XGB.pickle.dat","rb"))
    outcome = (model.predict_proba(data_t)[:, 1] >= .311)
    if outcome==True:
        time_p = "The patient is still in a <span style='color: #8a1e19'><b>critical stage</b></span>. Right now, the most accurate prediction in terms of survival cannot be made."
    else:
        time_p = "The patient can now <span style='color: #8a1e19'><b>safely survive</b></span> according to the given vitals. This is after <span style='color: #8a1e19'><b>"+str(timestamp/100)+"</b></span> hrs post admission."
    prob = model.predict_proba(data_t)
    return jsonify(str(outcome[0]),str(prob[0, 1]),missing_iv, time_p)

@app.route("/add_details", methods=['POST'])
def add_details():
    fname = request.json['filename']
    data = pd.read_csv(fname)
    master = pd.read_csv("master.csv")
    master = master.append(data, ignore_index=True)
    master.to_csv("master.csv", index=None)

@app.route("/view_details", methods=['POST'])
def view_details():
    recordID = request.json['recordID']
    master = pd.read_csv("master.csv")
    data = master[master['RecordID']==int(recordID)]
    return jsonify(data.transpose().to_html(classes='table table-striped" id= "a_nice_table', border=0, header=None, bold_rows=True))

if __name__ == "__main__":
    app.run(host='localhost', port=2000)
