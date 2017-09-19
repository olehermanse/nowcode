from flask import Flask, request, send_from_directory, redirect, render_template
import argparse
from base64 import urlsafe_b64encode as b64
import os

app = Flask(__name__)

from random import randint
import json

sessions = {}

def new_session():
    while True:
        a = b64(os.urandom(16))
        s = a.decode("ascii")[:8]

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

def get_args():
    argparser = argparse.ArgumentParser(description='Nowcode webserver/backend')
    argparser.add_argument('--ip',   '-i', help='IP', type=str, default="0.0.0.0")
    argparser.add_argument('--port', '-p', help='port number', type=int, default=5000)
    argparser.add_argument('--release', '-r', help='Release mode', action="store_true")
    args = argparser.parse_args()
    return args

def start_server(ip, port):
    app.run(ip, port=port)

if __name__ == "__main__":
    args = get_args()
    if not args.release:
        app.config['DEBUG'] = True
        app.config['TEMPLATES_AUTO_RELOAD'] = True
    start_server(args.ip, args.port)
