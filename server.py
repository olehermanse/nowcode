from flask import Flask, request, send_from_directory, redirect, render_template
app = Flask(__name__)
app.config['DEBUG'] = True
app.config['TEMPLATES_AUTO_RELOAD'] = True

from random import randint
import json

sessions = {}

def new_session():
    while True:
        s = str(randint(10000,99999))
        if s not in sessions:
            sessions[s] = ""
            return s

@app.route('/')
def root():
    return render_template("index.html")

@app.route('/new')
def new():
    return redirect("/{}".format(new_session()))

@app.route('/<string:session_name>', methods=["GET"])
def editor(session_name):
    if session_name not in sessions:
        return redirect("/")
    return render_template("editor.html")

@app.route('/data/<string:session_name>', methods=["GET"])
def get_contents(session_name):
    response = json.dumps({"contents": sessions[session_name]})
    print("response: {}".format(response))
    return json.dumps({"contents": sessions[session_name]})

@app.route("/<string:session_name>", methods=['POST'])
def post_data(session_name):
    if session_name not in sessions:
        return redirect("/")
    print(request.json)
    contents = json.loads(request.json)["contents"]
    sessions[session_name] = contents
    return "OK"

if __name__ == "__main__":
    app.run("0.0.0.0")
