from flask import Flask, render_template, Markup, jsonify, request, abort, redirect, Blueprint
from flask_restplus import Api, Resource, fields, Namespace

import argparse
import os
import sys
import json
import ast
from collections import OrderedDict
from base64 import urlsafe_b64encode as b64
from random import randint
import time
from flask_compress import Compress
import random

buffers = {}

app = Flask(__name__, static_url_path='', static_folder='web/dist')
Compress(app)
blueprint = Blueprint('api', __name__, url_prefix='/api')
api = Api(blueprint, version="0.1", title="Nowcode API")
app.register_blueprint(blueprint)

ns_buffers = api.namespace("buffers", description="Shared text buffers")
ns_check   = api.namespace("check",   description="Syntax checking")
ns_cursors = api.namespace("cursors", description="Cursors of other people")

cursor_model = api.model("Cursor",
{
    "tab_id":    fields.String(description="Unique identifier for each browser tab.", required=True),
    "line":      fields.Integer(description="Line number, starting from 1", required=True),
    "column":    fields.Integer(description="Column number, starting from 0.", required=True),
    "lastseen":  fields.Integer(description="Server timestamp from last POST", readOnly=True)
})

buffer_model = api.model("Buffer",
    {
        "buffer_id": fields.String(description="Unique identifier (url).", required=True),
        "content":   fields.String(description="All text in buffer.", required=True),
        "language":  fields.String(description="Programming lanugage used in buffer."),
        "sync_time": fields.Integer(description="Only POST to up-to-date sync_time is allowed.", required=True),
        "cursors":   fields.Raw(description="All active cursors (users).", readOnly=True)
    })

check_model = api.inherit("Check", buffer_model,
    {
        "status" : fields.Integer(description="0 for success.", readOnly=True),
        "message": fields.String(description="Stacktrace, error message, or similar.", readOnly=True)
    })

def timestamp():
    return int(round(time.time() * 1000))

def empty_buffer(buffer_id):
    return {
        "content":   "",
        "buffer_id": buffer_id,
        "sync_time": int(round(time.time() * 1000)),
        "cursors":   {}
    }

def buffer_content(buffer_id):
    return buffers[buffer_id]["content"]

def new_buffer():
    while True:
        a = b64(os.urandom(16))
        buffer_id = a.decode("ascii")[:8]

        if buffer_id not in buffers:
            buffers[buffer_id] = empty_buffer(buffer_id)
            return buffer_id

def get_request_json():
    if type(request.json) is str:
        return json.loads(request.json)
    elif type(request.json) is dict:
        return request.json
    return None

def syntax_check(code, language):
    message = "Success!"
    status = 0
    if language != "python3":
        return  -1, "Language not supported!"
    try:
        ast.parse(code)
    except SyntaxError as e:
        message = str(e)
        status = -1
    return status, message

# API
@ns_buffers.route("/<string:buffer_id>")
class Buffer(Resource):
    @ns_buffers.marshal_with(buffer_model, code=200)
    def get(self, buffer_id):
        """Get all content of a buffer"""
        if buffer_id not in buffers:
            return None, 404
        return buffers[buffer_id]

    @ns_buffers.expect(buffer_model)
    @ns_buffers.marshal_with(buffer_model, code=200)
    def post(self, buffer_id):
        """Create or update a buffer"""
        if buffer_id not in buffers:
            print("Reviving session: {}".format(buffer_id))
            buffers[buffer_id] = empty_buffer(buffer_id)
        body = get_request_json()
        if not body:
            return None, 404
        if body["sync_time"] != buffers[buffer_id]["sync_time"]:
            return buffers[buffer_id], 200
        content = body["content"]
        buffers[buffer_id]["content"] = content
        buffers[buffer_id]["sync_time"] = timestamp()

        print("Successful POST:")
        print(buffers[buffer_id])
        return buffers[buffer_id]

@ns_check.route("/")
class Check(Resource):
    @ns_buffers.expect(buffer_model)
    @ns_buffers.marshal_with(check_model, code=200)
    def post(self):
        """Syntax check a piece of code"""
        body = get_request_json()
        if not body:
            return None, 404
        response = OrderedDict(body)
        status, message = syntax_check(response["content"], response["language"])
        response["status"] = status
        response["message"] = message
        return response

@ns_cursors.route("/<string:buffer_id>")
class Cursor(Resource):
    @ns_cursors.expect(cursor_model)
    @ns_cursors.marshal_with(cursor_model, code=200)
    def post(self, buffer_id):
        """Create or update a cursor"""
        if buffer_id not in buffers:
            return None, 404
        cursor_body = get_request_json()
        tab_id = cursor_body["tab_id"]
        cursor_body["lastseen"] = timestamp()
        buffers[buffer_id]["cursors"][tab_id] = cursor_body
        return cursor_body

# Web server:
@app.route('/')
def root():
    return redirect("/{}".format(new_buffer()))

@app.route('/<string:buffer_id>', methods=["GET"])
def editor(buffer_id):
    return app.send_static_file('index.html')

def get_args():
    argparser = argparse.ArgumentParser(description='Nowcode webserver/backend')
    argparser.add_argument('--ip',      '-i', help='IP', type=str, default="0.0.0.0")
    argparser.add_argument('--port',    '-p', help='port number', type=int, default=5000)
    argparser.add_argument('--release', '-r', help='Release mode', action="store_true")
    argparser.add_argument('--docs',    '-d', help='Output docs', action="store_true")
    args = argparser.parse_args()
    return args

def start_server(ip, port):
    app.run(ip, port=port)


if __name__ == "__main__":
    args = get_args()
    app.config['RESTPLUS_VALIDATE'] = True
    if args.docs:
        app.config['SERVER_NAME'] = ""
        with app.app_context():
            print(json.dumps(api.__schema__, indent=2))
        sys.exit(0)
    elif args.release:
        pass
    else:
        app.config['SERVER_NAME'] = "127.0.0.1:5000"
        app.config['DEBUG'] = True
        app.config['TEMPLATES_AUTO_RELOAD'] = True
    start_server(args.ip, args.port)
