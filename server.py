from flask import Flask, render_template, Markup, jsonify, request, abort, redirect, Blueprint
from flask_restplus import Api, Resource, fields, Namespace

import argparse
import os
import sys
import json
from base64 import urlsafe_b64encode as b64
from random import randint

buffers = {}

app = Flask(__name__, static_url_path='', static_folder='web/dist')
blueprint = Blueprint('api', __name__, url_prefix='/api')
api = Api(blueprint, version="0.1", title="Nowcode API")
app.register_blueprint(blueprint)

ns_buffers = api.namespace("buffers", description="Shared text buffers")

buffer_model = api.model("Buffer",
    {
        "buffer_id": fields.String(description="Unique identifier (url)", required=True),
        "content": fields.String(description="All text in buffer", required=True)
    })


def new_buffer():
    while True:
        a = b64(os.urandom(16))
        s = a.decode("ascii")[:8]

        if s not in buffers:
            buffers[s] = ""
            return s
# API
@ns_buffers.route("/<string:buffer_id>")
class Buffer(Resource):
    @ns_buffers.marshal_with(buffer_model, code=201)
    def get(self, buffer_id):
        """Get all content of a buffer"""
        if buffer_id not in buffers:
            return None, 404
        response = {"buffer_id": buffer_id,
                    "content": buffers[buffer_id]}
        return response

    @ns_buffers.expect(buffer_model)
    @ns_buffers.marshal_with(buffer_model, code=201)
    def post(self, buffer_id):
        """Create or update a buffer"""
        if buffer_id not in buffers:
            print("Reviving session: {}".format(buffer_id))
        if type(request.json) is str:
            content = json.loads(request.json)["content"]
        elif type(request.json) is dict:
            content = request.json["content"]
        else:
            return None
        buffers[buffer_id] = content

        response = {"buffer_id": buffer_id,
                    "content": buffers[buffer_id]}
        return response

# Compatibility redirects:
@app.route('/data/<string:buffer_id>', methods=["GET"])
def get_content(buffer_id):
    return redirect("/api/buffers/{}".format(buffer_id))

@app.route("/<string:buffer_id>", methods=['POST'])
def post_data(buffer_id):
    return redirect("/api/buffers/{}".format(buffer_id))

# Web server:
@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/new')
def new():
    return redirect("/{}".format(new_buffer()))

@app.route('/<string:buffer_id>', methods=["GET"])
def editor(buffer_id):
    if buffer_id not in buffers:
        return redirect("/")
    return app.send_static_file('index.html')


def get_args():
    argparser = argparse.ArgumentParser(description='Nowcode webserver/backend')
    argparser.add_argument('--ip',   '-i', help='IP', type=str, default="0.0.0.0")
    argparser.add_argument('--port', '-p', help='port number', type=int, default=5000)
    argparser.add_argument('--release', '-r', help='Release mode', action="store_true")
    argparser.add_argument('--docs', '-d', help='Output docs', action="store_true")
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
